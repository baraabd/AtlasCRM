import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

import {
  assertLocalDemoDatabase,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  seedLocalDemo,
} from '../prisma/seed';
import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/application';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(60_000);

describe('PostgreSQL-backed authentication', () => {
  let app: INestApplication | undefined;
  let database: PrismaClient | undefined;
  let prisma: PrismaService;
  let token: string;
  let adminId: string;
  let tenantId: string;
  const schema = `auth_e2e_${randomUUID().replaceAll('-', '')}`;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeAll(async () => {
    const testUrl = process.env.TEST_DATABASE_URL;
    if (!testUrl)
      throw new Error(
        'TEST_DATABASE_URL is required; use a disposable atlascrm_test PostgreSQL database.',
      );
    const url = new URL(testUrl);
    if (!/^atlascrm_test(?:_[a-z0-9_]+)?$/i.test(url.pathname.slice(1))) {
      throw new Error(
        'Integration tests only accept database names atlascrm_test or atlascrm_test_<suffix>.',
      );
    }
    assertLocalDemoDatabase(testUrl, true);
    database = new PrismaClient({ datasources: { db: { url: testUrl } } });
    await database.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    url.searchParams.set('schema', schema);
    process.env.DATABASE_URL = url.toString();
    process.env.JWT_SECRET = randomBytes(32).toString('hex');

    // Each run owns a fresh schema; committed production migrations are not changed.
    execFileSync(
      process.execPath,
      [
        require.resolve('prisma/build/index.js'),
        'db',
        'push',
        '--skip-generate',
        '--schema',
        resolve(__dirname, '../prisma/schema.prisma'),
      ],
      { cwd: resolve(__dirname, '..'), env: process.env, stdio: 'pipe' },
    );

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    configureApplication(app);
    await app.init();
    prisma = app.get(PrismaService);
    const seed = await seedLocalDemo(prisma, { local: true });
    adminId = seed.userId;
    tenantId = seed.tenantId;
    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      .expect(201);
    token = login.body.token;
  });

  afterAll(async () => {
    await app?.close();
    if (database) {
      await database.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      await database.$disconnect();
    }
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  });

  it('reports readiness from the actual auth database', async () => {
    await request(app!.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('keeps one demo tenant and product set, preserving an existing password until explicitly reset', async () => {
    const previous = await prisma.user.findUniqueOrThrow({
      where: { id: adminId },
    });
    const customPassword = 'local-test-changed-password';
    await prisma.user.update({
      where: { id: adminId },
      data: { password: await bcrypt.hash(customPassword, 10) },
    });
    const repeated = await seedLocalDemo(prisma, { local: true });
    expect(repeated).toMatchObject({
      userId: adminId,
      tenantId,
      passwordChanged: false,
    });
    expect(await prisma.tenant.count()).toBe(1);
    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.serviceProduct.count({ where: { tenantId } })).toBe(4);
    expect(await prisma.lookupValue.count()).toBe(8);
    await request(app!.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: customPassword })
      .expect(201);
    await request(app!.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      .expect(401);

    await seedLocalDemo(prisma, { local: true, resetDemoPassword: true });
    const after = await prisma.user.findUniqueOrThrow({
      where: { id: adminId },
    });
    expect(after.tenantId).toBe(previous.tenantId);
    await request(app!.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      .expect(201);
  });

  it('requires explicit local seeding and rejects production or remote databases', () => {
    const local = 'postgresql://user@127.0.0.1:5432/atlascrm_local';
    expect(() => assertLocalDemoDatabase(local, false, 'development')).toThrow(
      'local-only',
    );
    expect(() => assertLocalDemoDatabase(local, true, 'production')).toThrow(
      'local-only',
    );
    expect(() =>
      assertLocalDemoDatabase(
        'postgresql://user@production.example/atlascrm_local',
        true,
        'development',
      ),
    ).toThrow('local PostgreSQL');
    expect(() =>
      assertLocalDemoDatabase(
        'postgresql://user@127.0.0.1/customer_data',
        true,
        'development',
      ),
    ).toThrow('local PostgreSQL');
  });

  it('normalizes email and returns the real user and tenant without secrets', async () => {
    const response = await request(app!.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: '  ADMIN@ALPHA.COM  ', password: DEMO_PASSWORD })
      .expect(201);
    expect(response.body).toMatchObject({
      user: { id: adminId, email: DEMO_EMAIL, tenantId, role: 'ADMIN' },
      tenant: { id: tenantId, name: 'Alpha Company (HQ)' },
    });
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('resetCode');
  });

  it.each([
    { email: DEMO_EMAIL, password: 'incorrect-password' },
    { email: 'missing@example.test', password: DEMO_PASSWORD },
  ])('rejects invalid credentials with 401', async (credentials) => {
    const result = await request(app!.getHttpServer())
      .post('/v1/auth/login')
      .send(credentials)
      .expect(401);
    expect(result.body.message).toBe('Invalid credentials');
  });

  it.each([
    {},
    { email: DEMO_EMAIL },
    { email: DEMO_EMAIL, password: 123456 },
    { email: 'not-an-email', password: DEMO_PASSWORD },
    { email: DEMO_EMAIL, password: DEMO_PASSWORD, tenantId: 'forged' },
  ])(
    'validates malformed login input before querying credentials',
    async (body) => {
      await request(app!.getHttpServer())
        .post('/v1/auth/login')
        .send(body)
        .expect(400);
    },
  );

  it('restores the profile from PostgreSQL and rejects missing or forged sessions', async () => {
    await prisma.user.update({
      where: { id: adminId },
      data: { name: 'Updated profile' },
    });
    const response = await request(app!.getHttpServer())
      .get('/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body).toMatchObject({
      id: adminId,
      name: 'Updated profile',
      tenantId,
      tenant: { id: tenantId },
    });
    expect(response.body).not.toHaveProperty('password');
    await request(app!.getHttpServer()).get('/v1/auth/me').expect(401);
    const forgedTenantToken = app!
      .get(JwtService)
      .sign({ sub: adminId, tenantId: randomUUID() });
    await request(app!.getHttpServer())
      .get('/v1/auth/me')
      .set('Authorization', `Bearer ${forgedTenantToken}`)
      .expect(401);
  });

  it('reads only authenticated tenant metadata, even with a forged tenant header', async () => {
    const other = await prisma.tenant.create({
      data: { name: 'Other test company' },
    });
    const privateService = await prisma.serviceProduct.create({
      data: {
        tenantId: other.id,
        nameAr: 'خاص',
        nameEn: 'Other tenant only',
        basePrice: 1,
        minPrice: 1,
      },
    });
    const response = await request(app!.getHttpServer())
      .get('/v1/metadata')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', other.id)
      .expect(200);
    expect(response.body.services).toHaveLength(4);
    expect(
      response.body.services.every(
        (service: { tenantId: string }) => service.tenantId === tenantId,
      ),
    ).toBe(true);
    expect(
      response.body.services.some(
        (service: { id: string }) => service.id === privateService.id,
      ),
    ).toBe(false);
  });

  it('returns the same session contract for a registered user', async () => {
    const result = await request(app!.getHttpServer())
      .post('/v1/auth/register')
      .send({
        fullName: 'Test Rep',
        email: '  NEW@EXAMPLE.TEST  ',
        password: 'new-local-password',
      })
      .expect(201);
    expect(result.body.user.email).toBe('new@example.test');
    expect(result.body.tenant.id).toBe(result.body.user.tenantId);
    const me = await request(app!.getHttpServer())
      .get('/v1/auth/me')
      .set('Authorization', `Bearer ${result.body.token}`)
      .expect(200);
    expect(me.body.id).toBe(result.body.user.id);
    expect(me.body.tenant).toEqual(result.body.tenant);
  });

  it('distinguishes a missing database schema from bad credentials without leaking SQL', async () => {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "User" RENAME TO "UnavailableUser"',
    );
    try {
      await request(app!.getHttpServer()).get('/health').expect(503);
      const result = await request(app!.getHttpServer())
        .post('/v1/auth/login')
        .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
        .expect(503);
      expect(result.body.code).toBe('DATABASE_SCHEMA_NOT_READY');
      expect(JSON.stringify(result.body)).not.toContain('prisma.user');
      expect(JSON.stringify(result.body)).not.toContain(
        process.env.DATABASE_URL!,
      );
    } finally {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "UnavailableUser" RENAME TO "User"',
      );
    }
  });
});

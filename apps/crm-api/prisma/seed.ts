import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v5 as uuidv5 } from 'uuid';

import { getDatabaseUrl } from '../src/config/environment';

export const DEMO_EMAIL = 'admin@alpha.com';
export const DEMO_PASSWORD = '123456';
const DEMO_TENANT_ID = 'a81bc307-159e-4c2e-957e-2042590f8a11';
const SERVICE_NAMESPACE = '5b407f6c-c80a-4c54-9545-987843a721e9';

interface SeedOptions {
  local: boolean;
  resetDemoPassword?: boolean;
  password?: string;
}

export function assertLocalDemoDatabase(
  databaseUrl: string,
  local: boolean,
  nodeEnv = process.env.NODE_ENV,
): void {
  if (!local || nodeEnv === 'production') {
    throw new Error(
      'Demo data is local-only. Use npm run seed:local and never NODE_ENV=production.',
    );
  }
  const url = new URL(databaseUrl);
  const allowedHosts = [
    'localhost',
    '127.0.0.1',
    '::1',
    '[::1]',
    'db',
    'postgres',
  ];
  const database = decodeURIComponent(url.pathname.slice(1));
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !allowedHosts.includes(url.hostname) ||
    !/^(atlascrm_local|atlascrm_test|crm_dev)(_[a-z0-9_]+)?$/i.test(database)
  ) {
    throw new Error(
      'Demo seeding requires a local PostgreSQL database named atlascrm_local, atlascrm_test, or crm_dev (an optional _suffix is allowed).',
    );
  }
}

export async function seedLocalDemo(
  prisma: PrismaClient,
  options: SeedOptions,
) {
  assertLocalDemoDatabase(getDatabaseUrl(), options.local);
  const password =
    options.password ?? process.env.ATLAS_DEMO_PASSWORD ?? DEMO_PASSWORD;
  if (password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error(
      'ATLAS_DEMO_PASSWORD must be at least 6 characters and no more than 72 UTF-8 bytes.',
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email: DEMO_EMAIL },
        include: { tenant: true },
      });
      // Reuse the original tenant when upgrading a database seeded by an older version.
      const tenant =
        existing?.tenant ??
        (await tx.tenant.upsert({
          where: { id: DEMO_TENANT_ID },
          update: {},
          create: { id: DEMO_TENANT_ID, name: 'Alpha Company (HQ)' },
        }));
      const admin = await tx.user.upsert({
        where: { email: DEMO_EMAIL },
        update: options.resetDemoPassword ? { password: hashedPassword } : {},
        create: {
          email: DEMO_EMAIL,
          password: hashedPassword,
          name: 'System Admin',
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      const lookups = [
        {
          category: 'CLIENT_TYPE',
          code: 'RETAIL',
          labelAr: 'تجزئة / محل',
          labelEn: 'Retail Store',
        },
        {
          category: 'CLIENT_TYPE',
          code: 'CORPORATE',
          labelAr: 'شركة / مؤسسة',
          labelEn: 'Corporate',
        },
        {
          category: 'CLIENT_TYPE',
          code: 'MEDICAL',
          labelAr: 'قطاع طبي',
          labelEn: 'Medical',
        },
        {
          category: 'CLIENT_TYPE',
          code: 'FOOD',
          labelAr: 'مطعم / كافيه',
          labelEn: 'F&B',
        },
        {
          category: 'REJECTION_REASON',
          code: 'PRICE',
          labelAr: 'السعر مرتفع',
          labelEn: 'Price too high',
        },
        {
          category: 'REJECTION_REASON',
          code: 'COMPETITOR',
          labelAr: 'لديه منافس',
          labelEn: 'Has Competitor',
        },
        {
          category: 'REJECTION_REASON',
          code: 'NOT_INTERESTED',
          labelAr: 'غير مهتم حالياً',
          labelEn: 'Not Interested',
        },
        {
          category: 'REJECTION_REASON',
          code: 'DECISION_MAKER',
          labelAr: 'المدير غير موجود',
          labelEn: 'No Decision Maker',
        },
      ];
      for (const lookup of lookups) {
        await tx.lookupValue.upsert({
          where: {
            category_code: { category: lookup.category, code: lookup.code },
          },
          update: {},
          create: lookup,
        });
      }

      const services = [
        {
          sku: 'DEMO-LANDING',
          nameAr: 'تصميم موقع تعريفي',
          nameEn: 'Landing Page',
          basePrice: 1500,
          minPrice: 1200,
        },
        {
          sku: 'DEMO-STORE',
          nameAr: 'متجر إلكتروني متكامل',
          nameEn: 'E-Commerce Store',
          basePrice: 4500,
          minPrice: 4000,
        },
        {
          sku: 'DEMO-SOCIAL',
          nameAr: 'إدارة سوشيال ميديا (شهر)',
          nameEn: 'Social Media Mgt',
          basePrice: 2000,
          minPrice: 1800,
        },
        {
          sku: 'DEMO-SEO',
          nameAr: 'تحسين محركات البحث (SEO)',
          nameEn: 'SEO Package',
          basePrice: 3000,
          minPrice: 2500,
        },
      ];
      for (const service of services) {
        // Older seed data has no SKU. Reuse it instead of creating duplicate products.
        const previous = await tx.serviceProduct.findFirst({
          where: {
            tenantId: tenant.id,
            OR: [{ sku: service.sku }, { nameEn: service.nameEn }],
          },
        });
        await tx.serviceProduct.upsert({
          where: {
            id:
              previous?.id ??
              uuidv5(`${tenant.id}:${service.sku}`, SERVICE_NAMESPACE),
          },
          update: {},
          create: {
            id: uuidv5(`${tenant.id}:${service.sku}`, SERVICE_NAMESPACE),
            ...service,
            tenantId: tenant.id,
          },
        });
      }
      return {
        email: admin.email,
        userId: admin.id,
        tenantId: tenant.id,
        passwordChanged: !existing || Boolean(options.resetDemoPassword),
      };
    },
    { isolationLevel: 'Serializable' },
  );
}

async function main() {
  const local = process.argv.includes('--local');
  assertLocalDemoDatabase(getDatabaseUrl(), local);
  const prisma = new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
  });
  try {
    const result = await seedLocalDemo(prisma, {
      local,
      resetDemoPassword: process.argv.includes('--reset-demo-password'),
    });
    console.log(`Local demo user ready: ${result.email}`);
    console.log(
      result.passwordChanged
        ? 'Demo password set from ATLAS_DEMO_PASSWORD, or the local-only default 123456.'
        : 'Existing password preserved. To reset only this demo user, rerun seed:local with -- --reset-demo-password.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Local seeding failed',
    );
    process.exitCode = 1;
  });
}

/*
 * Exercises the mobile application's actual HTTP modules against a running API.
 * Start the API with a disposable, seeded PostgreSQL database first, then set:
 * TEST_API_BASE_URL, TEST_API_EMAIL, and TEST_API_PASSWORD.
 *
 * React Native's platform detection is the only native dependency replaced here.
 * Requests, authentication, profile loading, and metadata use the app's own code.
 * This is an HTTP integration test, not an Android UI or emulator networking test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} before running the mobile/API integration test.`);
  return value;
}

async function main() {
  const url = new URL(requiredEnv('TEST_API_BASE_URL'));
  const email = requiredEnv('TEST_API_EMAIL');
  const password = requiredEnv('TEST_API_PASSWORD');

  assert.ok(['http:', 'https:'].includes(url.protocol), 'Use an HTTP(S) API URL.');
  assert.ok(
    ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname),
    'This test must target a local API backed by a disposable test database.',
  );
  assert.equal(url.username, '', 'Do not put credentials in the API URL.');
  assert.equal(url.password, '', 'Do not put credentials in the API URL.');
  assert.equal(url.pathname, '/', 'Use the API origin without /api or /v1.');
  assert.equal(url.search, '', 'Use the API origin without a query string.');
  assert.equal(url.hash, '', 'Use the API origin without a fragment.');

  process.env.EXPO_PUBLIC_API_BASE_URL = url.origin;
  // Keep local test credentials on loopback even when the runner configures a proxy.
  process.env.NO_PROXY = [process.env.NO_PROXY, url.hostname].filter(Boolean).join(',');
  process.env.no_proxy = process.env.NO_PROXY;
  globalThis.__DEV__ = true;

  const mobileRoot = path.resolve(__dirname, '../apps/crm-mobile/src');
  const previousLoad = Module._load;
  const previousTsExtension = require.extensions['.ts'];
  const platform = {
    OS: 'android',
    select: (options) => options.android ?? options.native ?? options.default,
  };

  Module._load = function loadWithPlatform(request, parent, isMain) {
    if (request === 'react-native') return { Platform: platform };
    return previousLoad.call(this, request, parent, isMain);
  };

  require.extensions['.ts'] = (module, filename) => {
    assert.ok(
      filename.startsWith(`${mobileRoot}${path.sep}`),
      'The test TypeScript loader only accepts mobile source files.',
    );
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    module._compile(compiled.outputText, filename);
  };

  let completed = 0;
  const check = async (name, test) => {
    await test();
    completed += 1;
    console.log(`PASS ${name}`);
  };
  const expectUnauthorized = async (request) => {
    await assert.rejects(request, (error) => {
      assert.equal(error.response?.status, 401, 'The API must reject the request with 401.');
      return true;
    });
  };

  try {
    const { http, setHttpAuthToken, setHttpTenantId } = require(
      path.join(mobileRoot, 'infra/api/http.ts'),
    );
    const { api } = require(path.join(mobileRoot, 'infra/api/api.ts'));
    const { authApi } = require(path.join(mobileRoot, 'infra/api/auth.ts'));
    const { metadataApi } = require(path.join(mobileRoot, 'infra/api/metadata.ts'));
    const { createAuthenticatedSession, readCachedSession } = require(
      path.join(mobileRoot, 'infra/auth/session.ts'),
    );

    await check('all mobile API modules share the configured connection', async () => {
      assert.strictEqual(
        api,
        http,
        'Business API requests must share the authenticated HTTP client.',
      );
      assert.equal(http.defaults.baseURL, url.origin);
    });

    await check('API health is reachable through the mobile HTTP client', async () => {
      const response = await http.get('/health');
      assert.equal(response.status, 200);
      assert.equal(response.data.status, 'ok');
      assert.equal(response.data.database, 'up');
    });

    await check('profile requires authentication', () =>
      expectUnauthorized(() => authApi.getProfile()),
    );

    let session;
    await check('mobile login returns a database user and its tenant', async () => {
      session = await authApi.login({ email, password });
      assert.equal(typeof session.token, 'string');
      assert.ok(session.token.length > 0, 'A successful login must return a token.');
      assert.equal(session.user.email, email.trim().toLowerCase());
      assert.equal(typeof session.user.id, 'string');
      assert.ok(session.user.id.length > 0);
      assert.equal(typeof session.user.tenantId, 'string');
      assert.equal(session.tenant.id, session.user.tenantId);
      assert.equal(typeof session.tenant.name, 'string');
      for (const field of ['password', 'resetCode', 'resetCodeExp']) {
        assert.ok(!(field in session.user), `The login response must exclude ${field}.`);
      }
      setHttpAuthToken(session.token);
      setHttpTenantId(session.user.tenantId);
    });

    await check('the login response becomes a restorable mobile workspace session', async () => {
      const mobileSession = createAuthenticatedSession(session.token, session.user, session.tenant);
      assert.equal(mobileSession.user.id, session.user.id);
      assert.equal(mobileSession.tenant.id, session.user.tenantId);
      const restored = readCachedSession(mobileSession.token, mobileSession.user);
      assert.ok(restored, 'The validated session must be suitable for offline restoration.');
      assert.equal(restored.tenant.id, session.user.tenantId);
    });

    await check('profile restores the same user and tenant', async () => {
      const profile = await authApi.getProfile();
      assert.equal(profile.id, session.user.id);
      assert.equal(profile.email, session.user.email);
      assert.equal(profile.tenantId, session.user.tenantId);
      assert.equal(profile.tenant.id, session.tenant.id);
      for (const field of ['password', 'resetCode', 'resetCodeExp']) {
        assert.ok(!(field in profile), `The profile response must exclude ${field}.`);
      }
    });

    let metadata;
    await check('mobile metadata loads services from the authenticated tenant', async () => {
      metadata = await metadataApi.fetchMetadata();
      assert.ok(Array.isArray(metadata.services));
      assert.ok(
        metadata.services.length > 0,
        "Seed this test user's tenant before running the test.",
      );
      assert.ok(metadata.lookups && typeof metadata.lookups === 'object');
      for (const service of metadata.services) {
        assert.equal(service.tenantId, session.user.tenantId);
      }
      if (process.env.TEST_EXPECTED_SERVICE_COUNT) {
        assert.equal(metadata.services.length, Number(process.env.TEST_EXPECTED_SERVICE_COUNT));
      }
    });

    await check('business API requests inherit the login authorization', async () => {
      const response = await api.get('/leads');
      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.data));
    });

    await check('a client-supplied tenant header cannot switch database access', async () => {
      setHttpTenantId('00000000-0000-0000-0000-000000000000');
      try {
        const other = await metadataApi.fetchMetadata();
        assert.deepEqual(
          other.services.map((service) => service.id).sort(),
          metadata.services.map((service) => service.id).sort(),
        );
        for (const service of other.services) assert.equal(service.tenantId, session.user.tenantId);
      } catch (error) {
        if (error.response?.status !== 403) throw error;
      } finally {
        setHttpTenantId(session.user.tenantId);
      }
    });

    await check('an incorrect password is rejected through the mobile login module', async () => {
      const invalidPassword =
        password === 'atlas-invalid-password-for-test'
          ? 'another-atlas-invalid-password-for-test'
          : 'atlas-invalid-password-for-test';
      await expectUnauthorized(() => authApi.login({ email, password: invalidPassword }));
    });

    await check('clearing the session removes authorization from every API module', async () => {
      setHttpAuthToken(null);
      setHttpTenantId(null);
      await expectUnauthorized(() => api.get('/leads'));
      await expectUnauthorized(() => authApi.getProfile());
    });

    console.log(`Mobile/API integration passed: ${completed} checks.`);
  } finally {
    Module._load = previousLoad;
    if (previousTsExtension) require.extensions['.ts'] = previousTsExtension;
    else delete require.extensions['.ts'];
  }
}

main().catch((error) => {
  // Axios error objects can contain Authorization headers. Never print the object.
  console.error(`Mobile/API integration failed: ${error.message}`);
  process.exitCode = 1;
});

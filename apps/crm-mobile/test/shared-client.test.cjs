require('./register-typescript.cjs');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { test } = require('node:test');

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'react-native') return { Platform: { OS: 'android' } };
  return originalLoad.call(this, request, parent, isMain);
};
global.__DEV__ = true;
for (const key of ['EXPO_PUBLIC_API_BASE_URL', 'EXPO_PUBLIC_API_HOST', 'EXPO_PUBLIC_API_PORT', 'EXPO_PUBLIC_USE_EMULATOR']) delete process.env[key];

const { http, setHttpAuthToken, setHttpTenantId } = require('../src/infra/api/http.ts');
const { api } = require('../src/infra/api/api.ts');
const { authApi } = require('../src/infra/api/auth.ts');
const { httpPost } = require('../src/infra/sync/sync.http.ts');

test('auth, domain, and sync requests share the emulator URL and session headers; logout clears them', async () => {
  assert.equal(api, http);
  const requests = [];
  http.defaults.adapter = async (config) => {
    requests.push(config);
    return { config, data: {}, status: 200, statusText: 'OK', headers: {} };
  };

  await authApi.login({ email: 'admin@alpha.com', password: 'test-password' });
  setHttpAuthToken('test-token');
  setHttpTenantId('real-tenant');
  await api.get('/leads');
  const result = await httpPost('/sync/pull', {});
  assert.equal(result.ok, true);

  assert.deepEqual(requests.map((request) => request.url), ['/v1/auth/login', '/leads', '/v1/sync/pull']);
  assert.ok(requests.every((request) => request.baseURL === 'http://10.0.2.2:3000'));
  assert.equal(requests[0].headers.Authorization, undefined);
  for (const request of requests.slice(1)) {
    assert.equal(request.headers.Authorization, 'Bearer test-token');
    assert.equal(request.headers['x-tenant-id'], 'real-tenant');
  }

  setHttpAuthToken(null);
  setHttpTenantId(null);
  await api.get('/leads');
  assert.equal(requests.at(-1).headers.Authorization, undefined);
  assert.equal(requests.at(-1).headers['x-tenant-id'], undefined);
});

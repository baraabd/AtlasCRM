require('./register-typescript.cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createAuthenticatedSession, readCachedSession } = require('../src/infra/auth/session.ts');

const tenant = { id: 'tenant-from-database', name: 'Alpha Company (HQ)' };
const user = { id: 'user-from-database', email: 'admin@alpha.com', name: 'System Admin', tenantId: tenant.id };

test('login and /me produce the same account and real workspace for restoration', () => {
  const loginSession = createAuthenticatedSession('test-token', user, tenant);
  const restoredSession = createAuthenticatedSession('test-token', { ...user, tenant });
  assert.deepEqual(loginSession, restoredSession);
  assert.equal(loginSession.user.tenant.id, tenant.id);
  assert.deepEqual(readCachedSession('test-token', loginSession.user), loginSession);
});

test('old fake workspaces, missing identities, and cross-tenant responses are not accepted', () => {
  assert.equal(readCachedSession('test-token', { id: user.id, email: user.email, name: user.name }), null);
  assert.throws(() => createAuthenticatedSession('test-token', user, { id: 't1', name: 'My Organization' }));
  assert.throws(() => createAuthenticatedSession('', user, tenant));
  assert.throws(() => createAuthenticatedSession('test-token', null, tenant));
});

test('an optional missing display name falls back to the authenticated email', () => {
  assert.equal(createAuthenticatedSession('test-token', { ...user, name: null }, tenant).user.name, user.email);
});

require('./register-typescript.cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { SessionLifecycle } = require('../src/infra/auth/session-lifecycle.ts');

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test('a profile response arriving after logout cannot restore a token or sign the user in', { timeout: 1000 }, async () => {
  const lifecycle = new SessionLifecycle();
  let stored = 'old-token';
  let visible = 'old-user';
  let writes = 0;
  const response = deferred();
  const operation = lifecycle.begin();
  const completion = response.promise.then(() => lifecycle.commit(operation, {
    write: async () => { writes += 1; stored = 'old-token'; },
    apply: () => { visible = 'old-user'; },
    clear: async () => { stored = null; },
  }));

  await lifecycle.clearSession(async () => { stored = null; }, () => { visible = null; });
  response.resolve();
  assert.equal(await completion, false);
  assert.equal(writes, 0);
  assert.equal(stored, null);
  assert.equal(visible, null);
});

test('logout clears a token even when an older SecureStore write is already in flight', { timeout: 1000 }, async () => {
  const lifecycle = new SessionLifecycle();
  let stored = null;
  let visible = 'old-user';
  const started = deferred();
  const release = deferred();
  const completion = lifecycle.commit(lifecycle.begin(), {
    write: async () => { started.resolve(); await release.promise; stored = 'old-token'; },
    apply: () => { visible = 'old-user'; },
    clear: async () => { stored = null; },
  });
  await started.promise;

  const logout = lifecycle.clearSession(async () => { stored = null; }, () => { visible = null; });
  assert.equal(visible, null, 'UI and authorization are reset immediately, without waiting on storage');
  release.resolve();
  await Promise.all([completion, logout]);
  assert.equal(stored, null);
  assert.equal(visible, null);
});

test('a new login after logout survives the old request and the queued logout clear', { timeout: 1000 }, async () => {
  const lifecycle = new SessionLifecycle();
  let stored = null;
  let visible = null;
  const started = deferred();
  const release = deferred();
  const oldLogin = lifecycle.commit(lifecycle.begin(), {
    write: async () => { started.resolve(); await release.promise; stored = 'old-token'; },
    apply: () => { visible = 'old-user'; },
    clear: async () => { stored = null; },
  });
  await started.promise;
  const logout = lifecycle.clearSession(async () => { stored = null; }, () => { visible = null; });
  const newLogin = lifecycle.commit(lifecycle.begin(), {
    write: async () => { stored = 'new-token'; },
    apply: () => { visible = 'new-user'; },
    clear: async () => { stored = null; },
  });

  release.resolve();
  await Promise.all([oldLogin, logout, newLogin]);
  assert.equal(stored, 'new-token');
  assert.equal(visible, 'new-user');
});

test('a failed storage write does not prevent the following logout from clearing storage', async () => {
  const lifecycle = new SessionLifecycle();
  let stored = 'partially-written-token';
  await assert.rejects(lifecycle.commit(lifecycle.begin(), {
    write: async () => { throw new Error('storage unavailable'); },
    apply: () => { throw new Error('must not apply'); },
    clear: async () => { stored = null; },
  }), /storage unavailable/);
  await lifecycle.clearSession(async () => { stored = null; }, () => {});
  assert.equal(stored, null);
});

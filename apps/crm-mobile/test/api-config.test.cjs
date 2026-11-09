require('./register-typescript.cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { resolveApiConfiguration } = require('../src/infra/api/config.ts');

test('development connects Android Emulator to the host API without a developer LAN address', () => {
  assert.equal(resolveApiConfiguration({}, 'android', true).baseUrl, 'http://10.0.2.2:3000');
  assert.equal(resolveApiConfiguration({}, 'ios', true).baseUrl, 'http://localhost:3000');
  assert.equal(resolveApiConfiguration({ port: '4010' }, 'android', true).baseUrl, 'http://10.0.2.2:4010');
  assert.equal(resolveApiConfiguration({ host: '192.168.1.20', useEmulator: 'true' }, 'android', true).baseUrl, 'http://10.0.2.2:3000');
});

test('explicit URLs win over host/emulator settings and preserve HTTPS and proxy paths', () => {
  const configuration = resolveApiConfiguration({
    baseUrl: ' https://crm.example.test/backend/ ',
    host: '10.0.2.2', port: '3000', useEmulator: 'true',
  }, 'android', false);
  assert.deepEqual(configuration, { baseUrl: 'https://crm.example.test/backend', error: null });
});

test('physical devices use an explicit LAN host and do not silently inherit an emulator address', () => {
  assert.equal(resolveApiConfiguration({ host: '192.168.1.20', useEmulator: 'false' }, 'android', true).baseUrl, 'http://192.168.1.20:3000');
  assert.match(resolveApiConfiguration({ useEmulator: 'false' }, 'android', true).error, /LAN address/);
});

test('release builds never fall back to local development or send credentials over HTTP', () => {
  assert.equal(resolveApiConfiguration({}, 'android', false).baseUrl, null);
  assert.match(resolveApiConfiguration({ baseUrl: 'http://api.example.test' }, 'android', false).error, /HTTPS/);
});

test('invalid addresses and common Swagger/version suffix mistakes give configuration errors', () => {
  for (const baseUrl of ['not-a-url', 'ftp://example.test', 'http://user:secret@example.test', 'https://example.test?token=secret', 'http://localhost:3000/api', 'http://localhost:3000/v1/']) {
    assert.equal(resolveApiConfiguration({ baseUrl }, 'android', true).baseUrl, null, baseUrl);
  }
  assert.equal(resolveApiConfiguration({ port: '70000' }, 'android', true).baseUrl, null);
});

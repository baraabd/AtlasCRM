require('./register-typescript.cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { getMetadataCacheKey } = require('../src/infra/api/metadata-cache.ts');

test('metadata caches are isolated by API, authenticated user, and tenant', () => {
  const first = getMetadataCacheKey('https://api.example.test', 'user-1', 'tenant-1');
  assert.notEqual(first, getMetadataCacheKey('https://api.example.test', 'user-2', 'tenant-1'));
  assert.notEqual(first, getMetadataCacheKey('https://api.example.test', 'user-1', 'tenant-2'));
  assert.notEqual(first, getMetadataCacheKey('https://staging.example.test', 'user-1', 'tenant-1'));
  assert.notEqual(first, 'app_metadata_cache');
  assert.equal(getMetadataCacheKey('https://api.example.test', undefined, null), null);
});

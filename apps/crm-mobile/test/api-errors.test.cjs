require('./register-typescript.cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { AxiosError } = require('axios');
const { getApiErrorMessage } = require('../src/infra/api/errors.ts');

const development = { baseUrl: 'http://10.0.2.2:3000', isDevelopment: true, unauthorizedMessage: 'Email or password is incorrect.' };
const fallback = 'Could not sign in.';

function responseError(status, data = {}) {
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, { status, data });
}

test('a network failure identifies the unreachable dev API instead of blaming the credentials', () => {
  const message = getApiErrorMessage(new AxiosError('Network Error', 'ERR_NETWORK'), fallback, development);
  assert.match(message, /Cannot reach the API at http:\/\/10\.0\.2\.2:3000/);
  assert.doesNotMatch(message, /password/);
});

test('a real 401 displays the credential message instead of a connection error', () => {
  assert.equal(getApiErrorMessage(responseError(401, { message: 'Invalid credentials' }), fallback, development), development.unauthorizedMessage);
});

test('timeouts and backend database unavailability remain distinct', () => {
  assert.match(getApiErrorMessage(new AxiosError('timeout', 'ECONNABORTED'), fallback, development), /did not respond in time/);
  assert.match(getApiErrorMessage(responseError(503, { code: 'DATABASE_SCHEMA_NOT_READY' }), fallback, development), /database is not ready/);
});

test('production network errors do not expose developer URLs and validation messages remain readable', () => {
  const message = getApiErrorMessage(new AxiosError('Network Error', 'ERR_NETWORK'), fallback, { ...development, isDevelopment: false });
  assert.doesNotMatch(message, /10\.0\.2\.2|EXPO_PUBLIC/);
  assert.equal(getApiErrorMessage(responseError(400, { message: ['Email is required', 'Password is required'] }), fallback, development), 'Email is required\nPassword is required');
});

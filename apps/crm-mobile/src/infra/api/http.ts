import axios from 'axios';
import { Platform } from 'react-native';

import { ApiConfigurationError, resolveApiConfiguration } from './config';
import { getApiErrorMessage } from './errors';

const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;

// Expo replaces only direct process.env.EXPO_PUBLIC_* references in the bundle.
export const apiConfiguration = resolveApiConfiguration(
  {
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    host: process.env.EXPO_PUBLIC_API_HOST,
    port: process.env.EXPO_PUBLIC_API_PORT,
    useEmulator: process.env.EXPO_PUBLIC_USE_EMULATOR,
  },
  Platform.OS,
  isDevelopment,
);

export const http = axios.create({
  baseURL: apiConfiguration.baseUrl ?? undefined,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

http.interceptors.request.use((config) => {
  if (apiConfiguration.error) {
    throw new ApiConfigurationError(apiConfiguration.error);
  }
  return config;
});

export function setHttpAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

export function setHttpTenantId(tenantId: string | null) {
  if (tenantId) {
    http.defaults.headers.common['x-tenant-id'] = tenantId;
  } else {
    delete http.defaults.headers.common['x-tenant-id'];
  }
}

export function formatApiError(error: unknown, fallback: string, unauthorizedMessage?: string) {
  return getApiErrorMessage(error, fallback, {
    baseUrl: apiConfiguration.baseUrl,
    isDevelopment,
    unauthorizedMessage,
  });
}

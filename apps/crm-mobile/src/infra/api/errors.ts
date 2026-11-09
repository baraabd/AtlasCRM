import axios from 'axios';

import { ApiConfigurationError } from './config';

type ErrorContext = {
  baseUrl: string | null;
  isDevelopment: boolean;
  unauthorizedMessage?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  context: ErrorContext,
): string {
  if (error instanceof ApiConfigurationError) {
    return context.isDevelopment ? error.message : 'The app cannot connect to its server. Please contact support.';
  }

  if (!axios.isAxiosError(error)) return fallback;

  const response = error.response;
  if (!response) {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    if (context.isDevelopment && context.baseUrl) {
      return timedOut
        ? `The API at ${context.baseUrl} did not respond in time. Check the API terminal and try again.`
        : `Cannot reach the API at ${context.baseUrl}. Check that the API is running and the device can reach this address.`;
    }
    return timedOut
      ? 'The server took too long to respond. Please try again.'
      : 'Cannot connect to the server. Check your internet connection and try again.';
  }

  if (response.status === 401) {
    return context.unauthorizedMessage || 'Your session has expired. Please sign in again.';
  }

  if (response.status >= 500) {
    const code = response.data?.code;
    if (context.isDevelopment && ['DATABASE_UNAVAILABLE', 'DATABASE_SCHEMA_NOT_READY'].includes(code)) {
      return 'The API is reachable, but its database is not ready. Check the API database configuration and migrations.';
    }
    return 'The server is temporarily unavailable. Please try again shortly.';
  }

  const message = response.data?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const messages = message.filter((item): item is string => typeof item === 'string');
    if (messages.length) return messages.join('\n');
  }
  return fallback;
}

type ApiEnvironment = {
  baseUrl?: string;
  host?: string;
  port?: string;
  useEmulator?: string;
};

export type ApiConfiguration =
  | { baseUrl: string; error: null }
  | { baseUrl: null; error: string };

export class ApiConfigurationError extends Error {
  readonly code = 'API_CONFIGURATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigurationError';
  }
}

/** All API clients use an origin, with endpoint versions supplied by their routes. */
export function resolveApiConfiguration(
  environment: ApiEnvironment,
  platform: string,
  isDevelopment: boolean,
): ApiConfiguration {
  const explicitUrl = environment.baseUrl?.trim();
  let baseUrl = explicitUrl;

  if (!baseUrl) {
    if (!isDevelopment) {
      return {
        baseUrl: null,
        error: 'Set EXPO_PUBLIC_API_BASE_URL to the HTTPS API address before building the app.',
      };
    }

    const host = environment.host?.trim();
    if (platform === 'android' && environment.useEmulator === 'false' && !host) {
      return {
        baseUrl: null,
        error: 'Set EXPO_PUBLIC_API_BASE_URL to your computer\'s LAN address for a physical Android device.',
      };
    }

    const port = environment.port?.trim() || '3000';
    if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
      return { baseUrl: null, error: 'EXPO_PUBLIC_API_PORT must be a port between 1 and 65535.' };
    }

    // Android Emulator reaches the host through 10.0.2.2, not localhost.
    const developmentHost = platform === 'android' && environment.useEmulator === 'true'
      ? '10.0.2.2'
      : host || (platform === 'android' ? '10.0.2.2' : 'localhost');
    baseUrl = `http://${developmentHost}:${port}`;
  }

  try {
    const url = new URL(baseUrl);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
      throw new Error('Invalid protocol');
    }
    if (url.username || url.password || url.search || url.hash) {
      throw new Error('API address must not contain credentials, a query, or a fragment');
    }
    if (!isDevelopment && url.protocol !== 'https:') {
      return { baseUrl: null, error: 'EXPO_PUBLIC_API_BASE_URL must use HTTPS in a release build.' };
    }

    const path = url.pathname.replace(/\/+$/, '');
    if (path === '/api' || path === '/v1') {
      return {
        baseUrl: null,
        error: 'EXPO_PUBLIC_API_BASE_URL must be the API origin without /api or /v1.',
      };
    }

    return { baseUrl: url.toString().replace(/\/+$/, ''), error: null };
  } catch {
    return {
      baseUrl: null,
      error: 'EXPO_PUBLIC_API_BASE_URL must be a valid HTTP(S) address without credentials or query parameters.',
    };
  }
}

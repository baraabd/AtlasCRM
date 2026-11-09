import type { Tenant, User } from '../../types/domain';

export type AuthenticatedSession = {
  token: string;
  user: User;
  tenant: Tenant;
};

export class InvalidAuthResponseError extends Error {
  constructor() {
    super('The server returned an incomplete account. Update the API and sign in again.');
    this.name = 'InvalidAuthResponseError';
  }
}

/** Accept workspace identity only from the authenticated API response. */
export function createAuthenticatedSession(
  token: string,
  user: User | null | undefined,
  tenant: Tenant | null | undefined = user?.tenant,
): AuthenticatedSession {
  if (
    typeof token !== 'string' || !token.trim() || !user ||
    typeof user.id !== 'string' || !user.id ||
    typeof user.email !== 'string' || !user.email ||
    typeof user.tenantId !== 'string' || !user.tenantId ||
    !tenant || typeof tenant.id !== 'string' || !tenant.id ||
    typeof tenant.name !== 'string' || !tenant.name || tenant.id !== user.tenantId
  ) {
    throw new InvalidAuthResponseError();
  }

  return {
    token,
    tenant,
    user: { ...user, name: typeof user.name === 'string' && user.name ? user.name : user.email, tenant },
  };
}

/** Legacy cached users without a real tenant must be refreshed through /me. */
export function readCachedSession(token: string, user: User | null): AuthenticatedSession | null {
  try {
    return createAuthenticatedSession(token, user);
  } catch {
    return null;
  }
}

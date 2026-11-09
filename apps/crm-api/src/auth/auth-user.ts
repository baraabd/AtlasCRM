import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

export interface AuthenticatedUser extends AuthUser {
  /** Kept for existing API consumers of the JWT strategy. */
  userId: string;
  tenant: { id: string; name: string };
}

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  tenantId: true,
  tenant: { select: { id: true, name: true } },
} as const;

export function publicUser(user: {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  tenantId: string;
}): AuthUser {
  return {
    id: user.id,
    name: user.name ?? user.email,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  };
}

import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

import { authApi } from '../infra/api/auth';
import type { LoginInput, RegisterInput } from '../infra/api/auth';
import { formatApiError, setHttpAuthToken, setHttpTenantId } from '../infra/api/http';
import { createAuthenticatedSession, InvalidAuthResponseError, readCachedSession } from '../infra/auth/session';
import type { AuthenticatedSession } from '../infra/auth/session';
import { SessionLifecycle } from '../infra/auth/session-lifecycle';
import { clearAuthData, getToken, getUserData, saveTenantId, saveToken, saveUserData } from '../infra/auth/storage';
import { initDb } from '../infra/db/db';
import { runMigrations } from '../infra/db/migrations';
import type { AuthStatus, Tenant, User } from '../types/domain';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  tenantId: string | null;
  user: User | null;
  tenants: Tenant[];
  error: string | null;
};

const signedOutState: AuthState = {
  status: 'signedOut', token: null, tenantId: null, user: null, tenants: [], error: null,
};

type AuthAction =
  | { type: 'BOOT_COMPLETE'; payload: AuthState }
  | { type: 'SESSION_READY'; session: AuthenticatedSession }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'BOOT_COMPLETE': return action.payload;
    case 'SESSION_READY': return {
      status: 'signedIn',
      token: action.session.token,
      tenantId: action.session.tenant.id,
      user: action.session.user,
      tenants: [action.session.tenant],
      error: null,
    };
    case 'SET_ERROR': return { ...state, error: action.error };
    case 'LOGOUT': return { ...signedOutState };
    default: return state;
  }
}

function setSessionHeaders(session: AuthenticatedSession) {
  setHttpAuthToken(session.token);
  setHttpTenantId(session.tenant.id);
}

async function persistSession(session: AuthenticatedSession) {
  // Save the complete account before the token so a partial write is not restorable.
  await clearAuthData();
  await saveUserData(session.user);
  await saveTenantId(session.tenant.id);
  await saveToken(session.token);
}

function authError(error: unknown, fallback: string, unauthorizedMessage?: string) {
  return error instanceof InvalidAuthResponseError
    ? error.message
    : formatApiError(error, fallback, unauthorizedMessage);
}

type AuthContextType = {
  state: AuthState;
  actions: {
    login: (input: LoginInput) => Promise<void>;
    register: (input: RegisterInput) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, otp: string, newPass: string) => Promise<void>;
    loadTenants: () => Promise<void>;
    selectTenant: (id: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
  };
};

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { ...signedOutState, status: 'booting' });
  const lifecycleRef = useRef<SessionLifecycle | null>(null);
  if (!lifecycleRef.current) lifecycleRef.current = new SessionLifecycle();
  const lifecycle = lifecycleRef.current;

  const acceptSession = useCallback((operation: number, session: AuthenticatedSession) =>
    lifecycle.commit(operation, {
      write: () => persistSession(session),
      clear: clearAuthData,
      apply: () => {
        setSessionHeaders(session);
        dispatch({ type: 'SESSION_READY', session });
      },
    }), [lifecycle]);

  const clearCurrentSession = useCallback(() => lifecycle.clearSession(clearAuthData, () => {
    setHttpAuthToken(null);
    setHttpTenantId(null);
    dispatch({ type: 'LOGOUT' });
  }), [lifecycle]);

  useEffect(() => {
    let cancelled = false;
    const operation = lifecycle.begin();
    const isCurrent = () => !cancelled && lifecycle.isCurrent(operation);
    const restore = async () => {
      try {
        await initDb();
        await runMigrations();
        const [token, cachedUser] = await lifecycle.read(() => Promise.all([getToken(), getUserData()]));
        if (!isCurrent()) return;
        if (!token) {
          setHttpAuthToken(null);
          setHttpTenantId(null);
          dispatch({ type: 'LOGOUT' });
          return;
        }

        setHttpAuthToken(token);
        setHttpTenantId(null);
        try {
          const profile = await authApi.getProfile();
          if (!isCurrent()) return;
          await acceptSession(operation, createAuthenticatedSession(token, profile));
        } catch (error) {
          if (!isCurrent()) return;
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            await clearCurrentSession();
            return;
          }

          // Preserve offline access only for a previously validated account and workspace.
          const unavailable = axios.isAxiosError(error) &&
            (!error.response || error.response.status >= 500);
          const cached = unavailable ? readCachedSession(token, cachedUser) : null;
          if (cached) {
            setSessionHeaders(cached);
            dispatch({ type: 'SESSION_READY', session: cached });
          } else {
            dispatch({
              type: 'BOOT_COMPLETE',
              payload: {
                ...signedOutState,
                status: 'needsTenant',
                token,
                user: cachedUser,
                error: authError(error, 'Could not load your workspace. Please try again.'),
              },
            });
          }
        }
      } catch {
        if (isCurrent()) {
          setHttpAuthToken(null);
          setHttpTenantId(null);
          dispatch({ type: 'LOGOUT' });
        }
      }
    };
    void restore();
    return () => {
      cancelled = true;
      lifecycle.invalidate();
    };
  }, [lifecycle, acceptSession, clearCurrentSession]);

  // Keep actions stable: the auth screens clear their errors when this object changes.
  const actions = useMemo(() => {
    const loadProfileSession = async (operation: number) => {
      const token = await lifecycle.read(getToken);
      if (!lifecycle.isCurrent(operation)) return null;
      if (!token) throw new InvalidAuthResponseError();
      setHttpAuthToken(token);
      const profile = await authApi.getProfile();
      if (!lifecycle.isCurrent(operation)) return null;
      return createAuthenticatedSession(token, profile);
    };

    return {
      login: async (input: LoginInput) => {
        const operation = lifecycle.begin();
        dispatch({ type: 'SET_ERROR', error: null });
        try {
          const response = await authApi.login(input);
          if (!lifecycle.isCurrent(operation)) return;
          await acceptSession(operation, createAuthenticatedSession(response.token, response.user, response.tenant));
        } catch (error) {
          if (!lifecycle.isCurrent(operation)) return;
          dispatch({
            type: 'SET_ERROR',
            error: authError(error, 'Could not sign in. Please try again.', 'Email or password is incorrect.'),
          });
          throw error;
        }
      },

      register: async (input: RegisterInput) => {
        const operation = lifecycle.begin();
        dispatch({ type: 'SET_ERROR', error: null });
        try {
          const response = await authApi.register(input);
          if (!lifecycle.isCurrent(operation)) return;
          await acceptSession(operation, createAuthenticatedSession(response.token, response.user, response.tenant));
        } catch (error) {
          if (!lifecycle.isCurrent(operation)) return;
          dispatch({ type: 'SET_ERROR', error: authError(error, 'Could not create your account. Please try again.') });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        const operation = lifecycle.begin();
        dispatch({ type: 'SET_ERROR', error: null });
        try {
          await authApi.forgotPassword(email);
        } catch (error) {
          if (!lifecycle.isCurrent(operation)) return;
          dispatch({ type: 'SET_ERROR', error: authError(error, 'Could not send the verification code.') });
          throw error;
        }
      },

      resetPassword: async (email: string, otp: string, newPass: string) => {
        const operation = lifecycle.begin();
        dispatch({ type: 'SET_ERROR', error: null });
        try {
          await authApi.resetPassword(email, otp, newPass);
        } catch (error) {
          if (!lifecycle.isCurrent(operation)) return;
          dispatch({ type: 'SET_ERROR', error: authError(error, 'Could not reset your password.') });
          throw error;
        }
      },

      loadTenants: async () => {
        const operation = lifecycle.begin();
        dispatch({ type: 'SET_ERROR', error: null });
        try {
          // The API currently assigns one tenant to a user; never invent a local tenant.
          const session = await loadProfileSession(operation);
          if (session) await acceptSession(operation, session);
        } catch (error) {
          if (!lifecycle.isCurrent(operation)) return;
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            await clearCurrentSession();
            return;
          }
          dispatch({ type: 'SET_ERROR', error: authError(error, 'Could not load your workspace. Please try again.') });
        }
      },

      selectTenant: async (id: string) => {
        const operation = lifecycle.begin();
        try {
          const session = await loadProfileSession(operation);
          if (!session) return;
          if (session.tenant.id !== id) throw new InvalidAuthResponseError();
          await acceptSession(operation, session);
        } catch (error) {
          if (!lifecycle.isCurrent(operation)) return;
          dispatch({ type: 'SET_ERROR', error: authError(error, 'Could not open this workspace.') });
          throw error;
        }
      },

      logout: clearCurrentSession,
      clearError: () => dispatch({ type: 'SET_ERROR', error: null }),
    };
  }, [lifecycle, acceptSession, clearCurrentSession]);

  return <AuthCtx.Provider value={{ state, actions }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

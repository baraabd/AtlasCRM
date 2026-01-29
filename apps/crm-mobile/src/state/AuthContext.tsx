import React, { createContext, useContext, useEffect, useReducer, useMemo } from 'react';

import { authApi, type LoginInput, type RegisterInput } from '../infra/api/auth';
import { setHttpAuthToken, setHttpTenantId } from '../infra/api/http';
import { getToken, saveToken, clearAuthData, getTenantId, saveTenantId, getUserData, saveUserData, clearTenantId } from '../infra/auth/storage';
import { initDb } from '../infra/db/db';
import { runMigrations } from '../infra/db/migrations';
import type { User, Tenant, AuthStatus } from '../types/domain';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  tenantId: string | null;
  user: User | null;
  tenants: Tenant[];
  error: string | null;
};

type AuthAction =
  | { type: 'BOOT_COMPLETE'; payload: Partial<AuthState> }
  | { type: 'LOGIN_SUCCESS'; token: string; user?: User }
  | { type: 'SET_TENANTS'; tenants: Tenant[] }
  | { type: 'SELECT_TENANT'; tenantId: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'BOOT_COMPLETE': return { ...state, ...action.payload, error: null };
    case 'LOGIN_SUCCESS': return { ...state, token: action.token, user: action.user || state.user, status: 'needsTenant', tenantId: null, error: null };
    case 'SET_TENANTS': return { ...state, tenants: action.tenants };
    case 'SELECT_TENANT': return { ...state, tenantId: action.tenantId, status: 'signedIn' };
    case 'SET_ERROR': return { ...state, error: action.error };
    case 'LOGOUT': return { status: 'signedOut', token: null, tenantId: null, user: null, tenants: [], error: null };
    default: return state;
  }
}

// ✅ تحديث النوع ليشمل الدوال الجديدة بشكل صريح
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
  const [state, dispatch] = useReducer(authReducer, {
    status: 'booting',
    token: null,
    tenantId: null,
    user: null,
    tenants: [],
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        console.log('[Auth] Booting...');
        await initDb();
        await runMigrations();
        const [token, tenantId, user] = await Promise.all([getToken(), getTenantId(), getUserData()]);
        
        if (token) setHttpAuthToken(token);
        if (tenantId) setHttpTenantId(tenantId);

        let status: AuthStatus = 'signedOut';
        if (token) status = tenantId ? 'signedIn' : 'needsTenant';

        dispatch({ type: 'BOOT_COMPLETE', payload: { token, tenantId, user, status } });
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    })();
  }, []);

  const actions = useMemo(() => ({
    login: async (input: LoginInput) => {
      try {
        dispatch({ type: 'SET_ERROR', error: null });
        const res = await authApi.login(input);
        await saveToken(res.token);
        await clearTenantId();
        if (res.user) await saveUserData(res.user);
        setHttpAuthToken(res.token);
        setHttpTenantId(null);
        dispatch({ type: 'LOGIN_SUCCESS', token: res.token, user: res.user });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: e.response?.data?.message || 'Login failed' });
        throw e;
      }
    },

    register: async (input: RegisterInput) => {
      try {
        dispatch({ type: 'SET_ERROR', error: null });
        const res = await authApi.register(input);
        await saveToken(res.token);
        await clearTenantId();
        if (res.user) await saveUserData(res.user);
        setHttpAuthToken(res.token);
        dispatch({ type: 'LOGIN_SUCCESS', token: res.token, user: res.user });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: e.response?.data?.message || 'Register failed' });
        throw e;
      }
    },

    forgotPassword: async (email: string) => {
      try {
        dispatch({ type: 'SET_ERROR', error: null });
        await authApi.forgotPassword(email);
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: e.response?.data?.message || 'Failed to send OTP' });
        throw e;
      }
    },

    resetPassword: async (email: string, otp: string, newPass: string) => {
      try {
        dispatch({ type: 'SET_ERROR', error: null });
        await authApi.resetPassword(email, otp, newPass);
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: e.response?.data?.message || 'Failed to reset password' });
        throw e;
      }
    },

    loadTenants: async () => {
        try {
            const fakeTenants: Tenant[] = [{ id: 't1', name: 'My Organization', industry: 'General' }];
            dispatch({ type: 'SET_TENANTS', tenants: fakeTenants });
        } catch { /* ignore */ }
    },

    selectTenant: async (id: string) => {
        try {
            await saveTenantId(id);
            setHttpTenantId(id);
            dispatch({ type: 'SELECT_TENANT', tenantId: id });
        } catch { /* ignore */ }
    },

    logout: async () => {
      await clearAuthData();
      setHttpAuthToken(null);
      setHttpTenantId(null);
      dispatch({ type: 'LOGOUT' });
    },

    clearError: () => dispatch({ type: 'SET_ERROR', error: null })
  }), []);

  return (
    <AuthCtx.Provider value={{ state, actions }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
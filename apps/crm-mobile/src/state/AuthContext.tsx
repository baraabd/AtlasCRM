import React, { createContext, useContext, useEffect, useReducer, useMemo } from 'react';

import { authApi, type LoginInput } from '../infra/api/auth';
import { setHttpAuthToken, setHttpTenantId } from '../infra/api/http';
import { tenantsApi } from '../infra/api/tenants';
import {
  getToken, saveToken, clearAuthData,
  getTenantId, saveTenantId, clearTenantId,
  getUserData, saveUserData
} from '../infra/auth/storage';
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
    case 'BOOT_COMPLETE':
      return { ...state, ...action.payload, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        token: action.token, 
        user: action.user || state.user,
        status: 'needsTenant', 
        tenantId: null, 
        error: null 
      };
    case 'SET_TENANTS':
      return { ...state, tenants: action.tenants };
    case 'SELECT_TENANT':
      return { ...state, tenantId: action.tenantId, status: 'signedIn' };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'LOGOUT':
      return { status: 'signedOut', token: null, tenantId: null, user: null, tenants: [], error: null };
    default:
      return state;
  }
}

const AuthCtx = createContext<{ state: AuthState; actions: any } | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    status: 'booting',
    token: null,
    tenantId: null,
    user: null,
    tenants: [],
    error: null,
  });

  // 1. Bootstrapping
  useEffect(() => {
    (async () => {
      try {
        // تهيئة قاعدة البيانات المحلية عند بدء التشغيل
        await initDb();
        await runMigrations();

        const [token, tenantId, user] = await Promise.all([
          getToken(),
          getTenantId(),
          getUserData()
        ]);

        if (token) setHttpAuthToken(token);
        if (tenantId) setHttpTenantId(tenantId);

        let status: AuthStatus = 'signedOut';
        if (token) {
          status = tenantId ? 'signedIn' : 'needsTenant';
        }

        dispatch({ 
          type: 'BOOT_COMPLETE', 
          payload: { token, tenantId, user, status } 
        });
      } catch (e) {
        console.error('Boot error:', e);
        dispatch({ type: 'LOGOUT' });
      }
    })();
  }, []);

  const actions = useMemo(() => ({
    login: async (input: LoginInput) => {
      try {
        dispatch({ type: 'SET_ERROR', error: null });
        
        // الاتصال الحقيقي بالسيرفر
        const res = await authApi.login(input);
        
        await saveToken(res.token);
        await clearTenantId();
        if (res.user) await saveUserData(res.user);

        setHttpAuthToken(res.token);
        setHttpTenantId(null);

        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          token: res.token, 
          user: res.user 
        });

      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: e.response?.data?.message || 'Login failed' });
        throw e;
      }
    },

    register: async (input: FormData) => {
      try {
        dispatch({ type: 'SET_ERROR', error: null });
        const res = await authApi.register(input);
        
        await saveToken(res.token);
        await clearTenantId();
        if (res.user) await saveUserData(res.user);

        setHttpAuthToken(res.token);
        dispatch({ type: 'LOGIN_SUCCESS', token: res.token, user: res.user });
      } catch(e: any) {
        dispatch({ type: 'SET_ERROR', error: e.response?.data?.message || 'Register failed' });
        throw e;
      }
    },

    loadTenants: async () => {
      try {
        // يمكن جلب الشركات من السيرفر، أو إذا كان المستخدم مرتبط بشركة واحدة فقط
        // يمكن تخطي هذه الخطوة أو جعلها وهمية مؤقتاً إذا لم يكن هناك Multi-tenancy API جاهز
        // هنا سنفترض أن المستخدم لديه شركة واحدة من التسجيل
        const fakeTenants: Tenant[] = [
            { id: 't1', name: 'My Organization', industry: 'General' },
        ];
        dispatch({ type: 'SET_TENANTS', tenants: fakeTenants });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load organizations' });
      }
    },

    selectTenant: async (id: string) => {
      try {
        await saveTenantId(id);
        setHttpTenantId(id);
        dispatch({ type: 'SELECT_TENANT', tenantId: id });
      } catch (e: any) {
        dispatch({ type: 'SET_ERROR', error: 'Failed to select organization' });
      }
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
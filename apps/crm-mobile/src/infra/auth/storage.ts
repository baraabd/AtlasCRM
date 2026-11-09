import * as SecureStore from 'expo-secure-store';

import type { User } from '../../types/domain';

const AUTH_KEYS = {
  TOKEN: 'auth_token',
  TENANT_ID: 'auth_tenant_id',
  USER_DATA: 'auth_user_data',
};

// --- Token ---
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEYS.TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(AUTH_KEYS.TOKEN);
}

// --- Tenant ---
export async function saveTenantId(tenantId: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEYS.TENANT_ID, tenantId);
}

export async function getTenantId(): Promise<string | null> {
  return await SecureStore.getItemAsync(AUTH_KEYS.TENANT_ID);
}

// ✅ الحل: تمت إضافة هذه الدالة المفقودة
export async function clearTenantId(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_KEYS.TENANT_ID);
}

// --- User Data ---
export async function saveUserData(user: User): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, JSON.stringify(user));
}

export async function getUserData(): Promise<User | null> {
  const data = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
}

// --- Clear All ---
export async function clearAuthData(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_KEYS.TOKEN),
    SecureStore.deleteItemAsync(AUTH_KEYS.TENANT_ID),
    SecureStore.deleteItemAsync(AUTH_KEYS.USER_DATA),
  ]);
}

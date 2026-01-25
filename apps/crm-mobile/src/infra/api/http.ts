// apps/crm-mobile/src/infra/api/http.ts

import axios from 'axios';

const MY_PC_IP = '192.168.68.54'; 

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  return `http://${MY_PC_IP}:3000`;
};

export const http = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  console.log(`📡 [HTTP] Request: ${config.method?.toUpperCase()} ${config.url}`);
  if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => Promise.reject(error));

// --- In-Memory Header Management ---

export const setHttpAuthToken = (token: string | null) => {
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common['Authorization'];
  }
  // ✅ تم حذف التعيين غير المستخدم (_currentToken)
};

export const setHttpTenantId = (tenantId: string | null) => {
  if (tenantId) {
    http.defaults.headers.common['x-tenant-id'] = tenantId;
  } else {
    delete http.defaults.headers.common['x-tenant-id'];
  }
  // ✅ تم حذف التعيين غير المستخدم (_currentTenantId)
};

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized: Token expired or invalid.');
    }
    return Promise.reject(error);
  }
);
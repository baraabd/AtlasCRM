// apps/crm-mobile/src/infra/api/api.ts

import axios from 'axios';

// تأكد من أن هذا الـ IP صحيح
const MY_PC_IP = '192.168.68.55'; 

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  return `http://${MY_PC_IP}:3000`;
};

// ✅ تصدير الثابت باسم 'api' لحل مشكلة visits.ts و leads.ts
export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  console.log(`📡 [API] Request: ${config.method?.toUpperCase()} ${config.url}`);
  if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => Promise.reject(error));

// --- In-Memory Header Management ---

export const setHttpAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setHttpTenantId = (tenantId: string | null) => {
  if (tenantId) {
    api.defaults.headers.common['x-tenant-id'] = tenantId;
  } else {
    delete api.defaults.headers.common['x-tenant-id'];
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized: Token expired or invalid.');
    }
    return Promise.reject(error);
  }
);
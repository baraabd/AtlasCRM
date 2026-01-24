// apps/crm-mobile/src/infra/api/http.ts

import axios from 'axios';
import { Platform } from 'react-native';

// ⚠️⚠️ استبدل هذا بعنوان IP جهاز الكمبيوتر الخاص بك ⚠️⚠️
const MY_PC_IP = '192.168.68.58'; // مثال، غيره للـ IP الخاص بك

// دالة ذكية لتحديد العنوان
const getBaseUrl = () => {
  // 1. الأولوية لمتغير البيئة (للإنتاج)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // 2. استخدام IP الشبكة هو الحل الأضمن للمحاكي والجهاز الحقيقي
  return `http://${MY_PC_IP}:3000`;
};

export const http = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000, // 15 ثانية
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

console.log(`🌐 [HTTP] Configured to connect to: ${getBaseUrl()}`);

// --- In-Memory Header Management ---
let _currentToken: string | null = null;
let _currentTenantId: string | null = null;

export const setHttpAuthToken = (token: string | null) => {
  _currentToken = token;
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common['Authorization'];
  }
};

export const setHttpTenantId = (tenantId: string | null) => {
  _currentTenantId = tenantId;
  if (tenantId) {
    http.defaults.headers.common['x-tenant-id'] = tenantId;
  } else {
    delete http.defaults.headers.common['x-tenant-id'];
  }
};

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized: Token expired or invalid.');
    }
    // طباعة عنوان الخطأ للمساعدة في التشخيص
    if (error.code === 'ERR_NETWORK') {
        console.error(`❌ Network Error when connecting to: ${error.config?.baseURL || error.config?.url}`);
    }
    return Promise.reject(error);
  }
);
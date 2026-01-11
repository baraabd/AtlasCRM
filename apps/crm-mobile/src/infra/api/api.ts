// apps/crm-mobile/src/infra/api/api.ts
import axios from 'axios';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  return Platform.select({
    android: 'http://10.0.2.2:3000',
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
  });
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
});

export async function getHealth(): Promise<string> {
  try {
    const response = await api.get('/health', { 
      timeout: 2000,
      validateStatus: (status) => status < 500 
    });

    if (response.status === 404) return 'Not Configured';
    return response.data?.status || 'OK';
  } catch {
    // ✅ تم حذف _error لإصلاح خطأ ESLint
    return 'Offline';
  }
}

api.interceptors.response.use(
  res => res,
  err => {
    console.error('🌐 API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);
// apps/crm-mobile/src/infra/api/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import { endpoints } from './endpoints'; // استيراد المسارات

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

// دالة التحقق من حالة السيرفر التي يطلبها الـ Dashboard
export async function getHealth(): Promise<string> {
  try {
    const response = await api.get('/health', { 
      timeout: 2000,
      // منع axios من إلقاء خطأ إذا كان الرد 404
      validateStatus: (status) => status < 500 
    });

    if (response.status === 404) return 'Not Configured';
    return response.data?.status || 'OK';
  } catch (error) {
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
// apps/crm-mobile/src/infra/api/api.ts

import axios from 'axios';
import { Platform } from 'react-native';

// ⚠️⚠️ نفس الـ IP هنا أيضاً ⚠️⚠️
const MY_PC_IP = '192.168.68.58'; // استبدله بـ IP جهازك

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // استخدام IP الشبكة الموحد
  return `http://${MY_PC_IP}:3000`;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(`🌐 [API] Configured to connect to: ${getBaseUrl()}`);

// ... (باقي الدوال مثل getHealth يمكن إضافتها هنا إذا كانت موجودة سابقاً)
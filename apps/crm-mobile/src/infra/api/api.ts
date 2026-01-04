import axios from 'axios';
import { Platform } from 'react-native';

// يفضّل ترك المنفذ ثابتاً إذا سيرفرك شغال على 3000
const API_PORT = Number(process.env.EXPO_PUBLIC_API_PORT ?? 3000);

/**
 * EXPO_PUBLIC_API_HOST:
 * - جهاز حقيقي: ضع IP جهاز الكمبيوتر على نفس الشبكة (مثال 192.168.1.56)
 * - محاكي أندرويد: يمكن تركه فارغاً وسيستخدم 10.0.2.2 تلقائياً
 */
const LAN_HOST = process.env.EXPO_PUBLIC_API_HOST?.trim();

// خيار إضافي إذا تريد إجبار استخدام المحاكي حتى لو وضعت LAN_HOST
const USE_ANDROID_EMULATOR =
  (process.env.EXPO_PUBLIC_USE_EMULATOR ?? 'false').toLowerCase() === 'true';

const host =
  Platform.OS === 'android'
    ? (USE_ANDROID_EMULATOR ? '10.0.2.2' : (LAN_HOST || '10.0.2.2'))
    : (LAN_HOST || 'localhost');

export const API_BASE_URL = `http://${host}:${API_PORT}`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export async function getHealth(): Promise<string> {
  const res = await api.get('/');
  return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
}

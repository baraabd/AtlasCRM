/* import axios from 'axios';
import { Platform } from 'react-native';

// ضع IP جهازك هنا أو من ENV (Expo public)
const LAN_HOST = process.env.EXPO_PUBLIC_API_HOST || '192.168.1.56';
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';
const USE_ANDROID_EMULATOR = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';

const HOST =
  Platform.OS === 'android' && USE_ANDROID_EMULATOR ? '10.0.2.2' : LAN_HOST;

export const API_BASE_URL = `http://${HOST}:${API_PORT}`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export async function getHealth(): Promise<string> {
  const res = await api.get<string>('/');
  return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
}
 */

import axios from 'axios';

export const API_BASE_URL = 'http://10.0.2.2:3000'; 
// ⚠️ إذا جهاز حقيقي غيّرها إلى IP جهازك:
// http://192.168.1.56:3000

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export async function getHealth(): Promise<string> {
  const res = await api.get('/');
  return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
}

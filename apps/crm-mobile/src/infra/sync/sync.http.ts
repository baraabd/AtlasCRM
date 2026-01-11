// apps/crm-mobile/src/infra/sync/sync.http.ts

import { Platform } from 'react-native';

// استيراد endpoints ليس ضرورياً هنا داخل الدوال العامة، 
// ولكن نستخدمه في BASE_URL إذا أردنا توحيد الإصدار

function getHost() {
  if (Platform.OS === 'android' && process.env.EXPO_PUBLIC_USE_EMULATOR === 'true') {
    return '10.0.2.2';
  }
  return process.env.EXPO_PUBLIC_API_HOST ?? '192.168.1.56';
}

const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

/**
 * ملاحظة: جعلنا BASE_URL ينتهي بـ /v1. 
 * بما أننا وضعنا المسارات في endpoints تبدأ بـ / (مثل /sync/push)، 
 * الدمج سيكون: http://host:3000/v1/sync/push
 */
const BASE_URL = `http://${getHost()}:${API_PORT}/v1`;

export type HttpResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

/**
 * دالة POST العامة - تستقبل المسار من endpoints
 */
export async function httpPost<T>(path: string, body: unknown): Promise<HttpResult<T>> {
  try {
    const url = `${BASE_URL}${path}`;
    console.log(`[HTTP] POST ${url}`); // للتصحيح (Debugging)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: T;
    try {
      data = text ? JSON.parse(text) : ({} as T);
    } catch {
      data = text as unknown as T;
    }

    if (!res.ok) {
      return { 
        ok: false, 
        status: res.status, 
        message: (data as any)?.message ?? text ?? 'Request failed' 
      };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, status: 0, message: e?.message ?? 'Network error' };
  }
}

/**
 * دالة GET العامة - تستقبل المسار من endpoints
 */
export async function httpGet<T>(path: string): Promise<HttpResult<T>> {
  try {
    const url = `${BASE_URL}${path}`;
    console.log(`[HTTP] GET ${url}`);

    const res = await fetch(url, { method: 'GET' });

    const text = await res.text();
    let data: T;
    try {
      data = text ? JSON.parse(text) : ({} as T);
    } catch {
      data = text as unknown as T;
    }

    if (!res.ok) {
      return { 
        ok: false, 
        status: res.status, 
        message: (data as any)?.message ?? text ?? 'Request failed' 
      };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, status: 0, message: e?.message ?? 'Network error' };
  }
}
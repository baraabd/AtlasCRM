import axios from 'axios';

import { formatApiError, http } from '../api/http';

export type HttpResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<HttpResult<T>> {
  try {
    const response = await http.request<T>({ method, url: `/v1${path}`, data: body });
    return { ok: true, data: response.data };
  } catch (error) {
    return {
      ok: false,
      status: axios.isAxiosError(error) ? error.response?.status ?? 0 : 0,
      message: formatApiError(error, 'Synchronization request failed.'),
    };
  }
}

export function httpPost<T>(path: string, body: unknown): Promise<HttpResult<T>> {
  return request<T>('POST', path, body);
}

export function httpGet<T>(path: string): Promise<HttpResult<T>> {
  return request<T>('GET', path);
}

// apps/crm-mobile/src/infra/api/auth.ts
import type { User, AuthResponse } from '../../types/domain';

import { http } from './http';

export type LoginInput = { email: string; password: string };

// ✅ 1. تعديل النوع: بدلاً من FormData، نستخدم كائن عادي (JSON)
export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  avatar?: any; // (اختياري حالياً)
}; 

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/v1/auth/login', input);
    return res.data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    // ✅ 2. الحل هنا: إزالة الهيدر الخاص بـ multipart/form-data
    // سنترك http.ts يتولى وضع header: application/json تلقائياً
    const res = await http.post<AuthResponse>('/v1/auth/register', input);
    
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await http.get<User>('/v1/auth/me');
    return res.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await http.post('/v1/auth/forgot-password', { email });
  },
};
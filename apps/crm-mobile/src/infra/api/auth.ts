import type { User, AuthResponse } from '../../types/domain';

import { http } from './http';

export type LoginInput = { email: string; password: string };
export type RegisterInput = { fullName: string; email: string; password: string; avatar?: any; }; 

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/v1/auth/login', input);
    return res.data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
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

  resetPassword: async (email: string, otp: string, newPass: string): Promise<void> => {
    await http.post('/v1/auth/reset-password', { email, otp, newPassword: newPass });
  },
};
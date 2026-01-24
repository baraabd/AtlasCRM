import type { User } from '../../types/domain';

import { http } from './http';

// --- 1. تعريف الأنواع (Types) ---
export type Tenant = {
  id: string;
  name: string;
  industry?: string;
  logoUrl?: string;
};

/**
 * مكتبة API الخاصة بإدارة الشركات/المستأجرين (Tenants)
 */
export const tenantsApi = {
  /**
   * جلب قائمة الشركات المرتبطة بالمستخدم الحالي
   * تسمى عند الدخول لحالة 'needsTenant'
   */
  listMyTenants: async (): Promise<Tenant[]> => {
    // استخدمنا المسار v1 للتوافق مع معايير الـ API السابقة
    const res = await http.get<Tenant[]>('/v1/tenants');
    return res.data;
  },

  /**
   * اختيار شركة معينة للعمل عليها
   * يقوم السيرفر عادةً بتحديث جلسة المستخدم أو إرجاع بيانات محدثة
   */
  selectTenant: async (tenantId: string): Promise<{ success: boolean; user?: User }> => {
    const res = await http.post<{ success: boolean; user?: User }>(`/v1/tenants/${tenantId}/select`);
    return res.data;
  },

  /**
   * إنشاء شركة جديدة (SaaS Flow)
   */
  createTenant: async (data: { name: string; industry?: string }): Promise<Tenant> => {
    const res = await http.post<Tenant>('/v1/tenants', data);
    return res.data;
  }
};

/**
 * تصدير الدالة بشكل منفصل أيضاً لزيادة التوافق مع الكود القديم
 */
export const listTenantsApi = tenantsApi.listMyTenants;
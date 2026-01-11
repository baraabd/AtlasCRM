// apps/crm-mobile/src/infra/api/endpoints.ts

export const endpoints = {
  // مسارات النظام الأساسية
  health: '/health',         // للتحقق من اتصال السيرفر
  
  // مسارات المزامنة (يتم استدعاؤها في sync.http.ts)
  // ملاحظة: إذا كان sync.http يضيف /v1 تلقائياً، نضع المسارات بدونها هنا
  syncPush: '/sync/push',    // لإرسال التغييرات المحلية للسيرفر
  syncPull: '/sync/pull',    // لجلب التغييرات الجديدة من السيرفر

  // مسارات الواجهة والعمليات (مستقبلاً)
  dashboard: '/dashboard',   // لجلب إحصائيات الشاشة الرئيسية
  leads: '/leads',           // لجلب قائمة العملاء كاملة (عند الحاجة)
  visits: '/visits',         // لعمليات الزيارات
} as const;
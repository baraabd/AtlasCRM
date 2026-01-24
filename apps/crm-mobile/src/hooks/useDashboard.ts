// apps/crm-mobile/src/hooks/useDashboard.ts

import { useState, useMemo } from 'react';

import type { DashboardData } from '../types/domain';

// ✅ تعريف نوع الخطأ
type DashboardError = { message: string };

export function useDashboard() {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('loading');
  const [data, setData] = useState<DashboardData | null>(null);
  
  // ✅✅ التغيير الجذري هنا: تحديد النوع يدوياً ليكون إما كائن خطأ أو null
  const [error, setError] = useState<DashboardError | null>(null);

  const actions = useMemo(() => ({
    refresh: async () => {
      setState('loading');
      setError(null);
      try {
        // محاكاة
        await new Promise(r => setTimeout(r, 800));
        
        setData({
          workTimerSec: 3665,
          stats: { visitsToday: 4, openDeals: 12, followUps: 5 },
          followUpsToday: [
             { id: '1', type: 'CALL', title: 'Call CEO of TechCorp', at: new Date().toISOString() },
             { id: '2', type: 'VISIT', title: 'Visit Branch #2', at: new Date().toISOString() }
          ],
        });
        setState('idle');
      } catch (e: any) {
        setState('error');
        // ✅ الآن هذا السطر صحيح لأننا عرفنا النوع
        setError({ message: e.message || 'Failed to load data' });
      }
    },
    openFollowUp: (id: string) => console.log('Open', id),
  }), []);

  // إضافة رسالة وهمية لعدم كسر الكود القديم
  const message = "OK"; 

  return { state, data, error, offline: false, actions, message };
}
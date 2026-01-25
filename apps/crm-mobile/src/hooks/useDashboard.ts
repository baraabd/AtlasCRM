// apps/crm-mobile/src/hooks/useDashboard.ts

// ✅ 1. أعدنا استيراد useMemo
import { useCallback, useState, useMemo } from 'react';

export function useDashboard() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const loadDashboard = useCallback(async () => {
    setState('loading');
    try {
      // محاكاة للبيانات
      await new Promise(r => setTimeout(r, 500));
      
      setData({
        workTimerSec: 3600,
        stats: { visitsToday: 5, openDeals: 2, followUps: 1 },
        followUpsToday: []
      });
      setState('success');
    } catch (err: any) {
      setError(err);
      setState('error');
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  const openFollowUp = useCallback((id: string) => {
    console.log('Open follow up', id);
  }, []);

  // ✅ 2. الحل الجذري: استخدام useMemo لتثبيت كائن الـ actions
  // هذا يمنع useEffect في DashboardScreen من الدخول في حلقة لا نهائية
  const actions = useMemo(() => ({
    loadDashboard,
    refresh,
    openFollowUp
  }), [loadDashboard, refresh, openFollowUp]);

  return {
    state,
    data,
    error,
    offline: false,
    actions // ✅ نرجع الكائن المثبت
  };
}
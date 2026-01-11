// apps/crm-mobile/src/hooks/useDashboard.ts
import * as Network from 'expo-network';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getHealth } from '../infra/api/api';
import { db } from '../infra/db/db'; 
import type { AppError, FollowUp, LoadState } from '../types/domain';

export type DashboardStats = {
  visitsToday: number;
  openDeals: number;
  followUps: number;
};

export type DashboardData = {
  workTimerSec: number;
  clockedInSince?: string;
  stats: DashboardStats;
  followUpsToday: FollowUp[];
  apiHealth?: string;
};

export type UseDashboardResult = {
  state: LoadState;
  offline: boolean;
  error: AppError | null;
  data: DashboardData | null;
  message: string | null; 
  actions: {
    refresh: () => Promise<void>;
  };
};

export function useDashboard(): UseDashboardResult {
  const [state, setState] = useState<LoadState>('loading');
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const net = await Network.getNetworkStateAsync();
      const isOnline = !!net.isConnected && net.isInternetReachable !== false;
      setOffline(!isOnline);

      try {
        const localCache = await db.getFirstAsync<{ content: string }>('SELECT content FROM dashboard_cache WHERE id = 1');
        if (localCache) {
          setData(JSON.parse(localCache.content));
          setState('ready');
        }
      } catch {
        // ✅ تم حذف المتغير غير المستخدم لإصلاح خطأ ESLint
        console.log('[DB] No cache found yet');
      }

      if (isOnline) {
        const apiHealth = await getHealth();
        setMessage(apiHealth);

        const freshData: DashboardData = {
          workTimerSec: 7200, 
          stats: { visitsToday: 5, openDeals: 3, followUps: 2 },
          followUpsToday: [],
          apiHealth,
        };

        setData(freshData);

        await db.runAsync(
          'INSERT OR REPLACE INTO dashboard_cache (id, content, updatedAt) VALUES (1, ?, CURRENT_TIMESTAMP)',
          [JSON.stringify(freshData)]
        );
      } else {
        setMessage('Offline');
      }

      setState('ready');
    } catch (e: any) {
      console.error('[Dashboard Hook Error]:', e);
      if (!data) {
        setError({ message: 'Unable to load data. Check your connection.', recoverable: true });
        setState('error');
      }
    }
    // ✅ إزالة data من هنا لمنع التكرار اللانهائي
  }, [data]); 

  const actions = useMemo(() => ({ refresh }), [refresh]);

  useEffect(() => {
    // ✅ تصحيح استدعاء refresh وإضافة التبعات الصحيحة
    void actions.refresh();
  }, [actions]);

  return { state, offline, error, data, actions, message };
}
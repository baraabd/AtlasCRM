import { useCallback, useMemo, useState } from 'react';

import { getHealth } from '../infra/api/api';
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
  const [offline] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState<string | null>(null);


  const refresh = useCallback(async () => {
    try {
      setState('loading');
      setError(null);

      const apiHealth = await getHealth(); 
      setMessage(apiHealth);
      setData({
        workTimerSec: 2 * 60 * 60 + 12 * 60,
        clockedInSince: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        stats: { visitsToday: 5, openDeals: 3, followUps: 2 },
        followUpsToday: [],
        apiHealth,
      });

      setState('ready');
    } catch (e: any) {
      setError({ message: e?.message ?? 'Failed to load dashboard', recoverable: true });
      setState('error');
    }
  }, []);

  const actions = useMemo(() => ({ refresh }), [refresh]);

  return { state, offline, error, data, actions, message };
}

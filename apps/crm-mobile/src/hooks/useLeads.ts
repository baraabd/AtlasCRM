import { useCallback, useMemo, useState } from 'react';

import { createLead, getLeads, type CreateLeadInput } from '../infra/api/leads';
import type { Lead, LoadState } from '../types/domain';

type UseLeads = {
  state: LoadState;
  error: string | null;
  items: Lead[];
  byId: Map<string, Lead>;
  refresh: () => Promise<void>;
  create: (input: CreateLeadInput) => Promise<Lead>;
};

export function useLeads(): UseLeads {
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Lead[]>([]);

  const refresh = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const data = await getLeads();
      setItems(data);
      setState('ready');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load leads';
      setError(msg);
      setState('error');
    }
  }, []);

  const create = useCallback(async (input: CreateLeadInput) => {
    try {
      setState('loading');
      setError(null);
      const created = await createLead(input);

      // ✅ الخيار 1: تحديث لحظي (بدون refetch)
      setItems((prev) => [created, ...prev]);

      setState('ready');
      return created;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create lead';
      setError(msg);
      setState('error');
      throw e;
    }
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const l of items) map.set(l.id, l);
    return map;
  }, [items]);

 // ✅ مهم: نُرجع object memoized حتى لا يتغير بكل render
  return useMemo(
    () => ({
      state,
      error,
      items,
      byId,
      refresh,
      create,
    }),
    [state, error, items, byId, refresh, create],
  );
}


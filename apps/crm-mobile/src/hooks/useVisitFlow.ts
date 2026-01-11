import { useCallback, useMemo, useState } from 'react';

import type { AppError, Lead, LoadState } from '../types/domain';

export type UseVisitFlowResult = {
  leads: {
    state: LoadState;
    items: Lead[];
    query: string;
    selectedLeadId?: string;
    error: AppError | null;
    offline: boolean;
  };

  live: {
    state: LoadState;
    visitId?: string;
    elapsedSec: number;
    error: AppError | null;
  };

  actions: {
    setQuery: (q: string) => void;
    refreshLeads: () => Promise<void>;
    selectLead: (leadId: string) => void;

    startVisit: (leadId: string) => Promise<{ visitId: string }>;
    tick: () => void;
  };
};

const mockLeads: Lead[] = [
  { id: 'lead_1', name: 'Cafe Milano', businessType: 'Cafe', distanceM: 120, phone: ['+963 9xx xxx xxx'], hasOpenDeal: true },
  { id: 'lead_2', name: 'Dental Smile Clinic', businessType: 'Clinic', distanceM: 540, phone: ['+963 9xx xxx xxx'], hasOpenDeal: false },
  { id: 'lead_3', name: 'Auto Parts Center', businessType: 'Retail', distanceM: 980, phone: ['+963 9xx xxx xxx'], hasOpenDeal: false },
];

export function useVisitFlow(): UseVisitFlowResult {
  const [leadState, setLeadState] = useState<LoadState>('loading');
  const [items, setItems] = useState<Lead[]>([]);
  const [query, setQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined);
  const [leadError, setLeadError] = useState<AppError | null>(null);
  const [offline] = useState(false);

  const [liveState, setLiveState] = useState<LoadState>('idle');
  const [visitId, setVisitId] = useState<string | undefined>(undefined);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [liveError, setLiveError] = useState<AppError | null>(null);

  const refreshLeads = useCallback(async () => {
    try {
      setLeadState('loading');
      setLeadError(null);

      // Mock الآن — Sprint 2 سنربط API
      setItems(mockLeads);
      setLeadState(mockLeads.length ? 'ready' : 'empty');
    } catch (e: any) {
      setLeadError({ message: e?.message ?? 'Failed to load leads', recoverable: true });
      setLeadState('error');
    }
  }, []);

  const selectLead = useCallback((leadId: string) => setSelectedLeadId(leadId), []);

  const startVisit = useCallback(async (leadId: string) => {
  try {
    setLiveState('loading');
    setLiveError(null);

    // ✅ FIX: use leadId (prevents unused var lint error)
    const newVisitId = `visit_${leadId}_${Date.now()}`;

    setVisitId(newVisitId);
    setElapsedSec(0);
    setLiveState('ready');

    return { visitId: newVisitId };
  } catch (e: any) {
    setLiveError({ message: e?.message ?? 'Failed to start visit', recoverable: true });
    setLiveState('error');
    throw e;
  }
}, []);


  const tick = useCallback(() => setElapsedSec((s) => s + 1), []);

  const actions = useMemo(
    () => ({ setQuery, refreshLeads, selectLead, startVisit, tick }),
    [refreshLeads, selectLead, startVisit, tick],
  );

  return {
    leads: { state: leadState, items, query, selectedLeadId, error: leadError, offline },
    live: { state: liveState, visitId, elapsedSec, error: liveError },
    actions,
  };
}

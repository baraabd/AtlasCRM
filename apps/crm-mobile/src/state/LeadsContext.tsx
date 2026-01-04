import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';

import { useLeads } from '../hooks/useLeads';

type LeadsCtx = ReturnType<typeof useLeads>;

const Ctx = createContext<LeadsCtx | null>(null);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const leads = useLeads();
  const didInitRef = useRef(false);

  const { refresh } = leads;

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo(() => leads, [leads]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLeadsCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLeadsCtx must be used within LeadsProvider');
  return ctx;
}

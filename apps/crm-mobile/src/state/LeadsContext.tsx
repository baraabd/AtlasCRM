import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { listLeads, upsertLeadLocal } from '../infra/repos/leads.repo';
import { runSyncWithRetry } from '../infra/sync/sync.service';
import type { Lead } from '../types/domain';

type LeadsContextType = {
  leads: Lead[];
  create: (data: { name: string; businessType?: string; phones?: string[] }) => Promise<Lead>;
  refreshLeads: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const LeadsCtx = createContext<LeadsContextType | null>(null);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLeads();
      setLeads(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load leads from database');
    } finally {
      setLoading(false);
    }
  }, []);

  // تحميل البيانات عند البدء
  useEffect(() => {
    refreshLeads();
  }, [refreshLeads]);

  const create = async (data: { name: string; businessType?: string; phones?: string[] }): Promise<Lead> => {
    setLoading(true);
    try {
      // 1. حفظ محلي (Offline)
      const id = await upsertLeadLocal({
        name: data.name,
        businessType: data.businessType,
        phones: data.phones
      });

      // 2. تحديث الواجهة
      await refreshLeads();

      // 3. محاولة المزامنة في الخلفية (إذا كان متصلاً)
      runSyncWithRetry(1).catch(err => console.log('Background sync failed, queued for later.'));

      // إرجاع كائن العميل الجديد
      return { 
        id, 
        name: data.name, 
        businessType: data.businessType || null, 
        phones: data.phones 
      } as Lead;

    } catch (e) {
      setError('Failed to create lead');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LeadsCtx.Provider value={{ leads, create, refreshLeads, loading, error }}>
      {children}
    </LeadsCtx.Provider>
  );
}

export const useLeadsCtx = () => {
  const ctx = useContext(LeadsCtx);
  if (!ctx) throw new Error('useLeadsCtx outside provider');
  return ctx;
};
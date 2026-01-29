import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { listLeads, upsertLeadLocal } from '../infra/repos/leads.repo';
import { runSyncWithRetry } from '../infra/sync/sync.service';
import type { Lead } from '../types/domain';

// ✅ 1. تحديث تعريف الأنواع ليشمل الدالة الجديدة
type LeadsContextType = {
  leads: Lead[];
  create: (data: { name: string; businessType?: string; phones?: string[] }) => Promise<Lead>;
  refreshLeads: () => Promise<void>;
  // دالة البحث التي كانت مفقودة في التعريف
  findLeadsByPhone: (phone: string) => Lead[]; 
  checkDuplicate: (phone: string, name?: string) => Lead | undefined; 
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
    } catch {
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLeads();
  }, [refreshLeads]);

  // دالة البحث عن العملاء بنفس الرقم (ترجع مصفوفة)
  const findLeadsByPhone = useCallback((phone: string): Lead[] => {
    const cleanPhone = phone.trim();
    if (cleanPhone.length < 5) return []; 

    return leads.filter(l => 
      (l.phones && l.phones.includes(cleanPhone)) || l.phoneNumber === cleanPhone
    );
  }, [leads]);

  // دالة التحقق من التكرار الدقيق (ترجع عميل واحد)
  const checkDuplicate = useCallback((phone: string, name?: string): Lead | undefined => {
    const cleanPhone = phone.trim();
    const cleanName = name?.trim().toLowerCase();
    return leads.find(l => {
      const phoneMatch = (l.phones && l.phones.includes(cleanPhone)) || l.phoneNumber === cleanPhone;
      const nameMatch = cleanName && l.name.toLowerCase() === cleanName;
      return phoneMatch || nameMatch;
    });
  }, [leads]);

  const create = async (data: { name: string; businessType?: string; phones?: string[] }): Promise<Lead> => {
    setLoading(true);
    try {
      const id = await upsertLeadLocal({
        name: data.name,
        businessType: data.businessType,
        phones: data.phones
      });

      await refreshLeads();
      runSyncWithRetry(1).catch(() => console.log('Background sync queued.'));

      return { 
        id, 
        name: data.name, 
        businessType: data.businessType || null, 
        phones: data.phones,
        phoneNumber: data.phones?.[0]
      } as Lead;

    } catch {
      setError('Failed to create lead');
      throw new Error('Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ تمرير الدالة الجديدة findLeadsByPhone هنا
    <LeadsCtx.Provider value={{ leads, create, refreshLeads, checkDuplicate, findLeadsByPhone, loading, error }}>
      {children}
    </LeadsCtx.Provider>
  );
}

export const useLeadsCtx = () => {
  const ctx = useContext(LeadsCtx);
  if (!ctx) throw new Error('useLeadsCtx outside provider');
  return ctx;
};
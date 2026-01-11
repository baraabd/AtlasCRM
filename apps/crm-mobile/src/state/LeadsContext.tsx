import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

import * as leadsRepo from '../infra/repos/leads.repo';

interface LeadsContextType {
  leads: any[];
  createLead: (input: any) => Promise<string>;
  refreshLeads: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ دالة تحديث القائمة مع سجلات تتبع
  const refreshLeads = useCallback(async () => {
    console.log('[CONTEXT] 🔄 refreshLeads started...');
    try {
      const data = await leadsRepo.listLeads();
      console.log(`[CONTEXT] Successfully fetched ${data.length} leads from Repo.`);
      setLeads(data);
    } catch (err: any) {
      console.error("[CONTEXT] ❌ Failed to refresh leads:", err.message);
    }
  }, []);

  // جلب البيانات عند تشغيل التطبيق
  useEffect(() => {
    console.log('[CONTEXT] LeadsProvider mounted. Initial fetch...');
    refreshLeads();
  }, [refreshLeads]);

  // ✅ دالة إنشاء العميل مع تتبع الخطوات
  const createLead = useCallback(async (input: any) => {
    console.log('[CONTEXT] 🚀 createLead called with data:', JSON.stringify(input));
    setLoading(true);
    setError(null);
    
    try {
      // 1. استدعاء مستودع البيانات للحفظ المحلي
      console.log('[CONTEXT] Calling leadsRepo.upsertLeadLocal...');
      const id = await leadsRepo.upsertLeadLocal(input);
      console.log(`[CONTEXT] Local save successful. New ID: ${id}`);
      
      // 2. تحديث الحالة المحلية فوراً ليظهر العميل في القائمة
      console.log('[CONTEXT] Triggering immediate list refresh...');
      await refreshLeads(); 
      
      console.log('[CONTEXT] ✅ createLead flow completed.');
      return id;
    } catch (err: any) {
      console.error('[CONTEXT] ❌ Error in createLead flow:', err.message);
      setError(err.message || 'Save failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshLeads]);

  return (
    <LeadsContext.Provider value={{ leads, createLead, refreshLeads, loading, error }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeadsCtx = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    console.error('[CONTEXT] ❌ useLeadsCtx used outside of Provider!');
    throw new Error('useLeadsCtx must be used within LeadsProvider');
  }
  return context;
};
// apps/crm-mobile/src/state/LeadsContext.tsx

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { listLeads, upsertLeadLocal } from "../infra/repos/leads.repo";
import { runSyncWithRetry } from "../infra/sync/sync.service";
import type { Lead } from "../types/domain";

export type CreateLeadInput = {
  name: string;
  businessType?: string;
  phones?: string[];
  location?: { longitude: number; latitude: number };
};

type LeadsContextType = {
  leads: Lead[];
  create: (data: CreateLeadInput) => Promise<Lead>;
  refreshLeads: () => Promise<void>;
  findLeadsByPhone: (phone: string) => Lead[];
  checkDuplicate: (phone: string, name?: string) => Lead | undefined;
  loading: boolean;
  error: string | null;
};

const leadsCtx = createContext<LeadsContextType | null>(null);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLeads();
      setLeads(data);
      setError(null);
    } catch {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLeads();
  }, [refreshLeads]);

  const findLeadsByPhone = useCallback(
    (phone: string): Lead[] => {
      const cleanPhone = phone.trim();
      if (cleanPhone.length < 5) return [];

      return leads.filter(
        l => (Array.isArray(l.phones) && l.phones.includes(cleanPhone)) || l.phoneNumber === cleanPhone
      );
    },
    [leads]
  );

  const checkDuplicate = useCallback(
    (phone: string, name?: string): Lead | undefined => {
      const cleanPhone = phone.trim();
      const cleanName = name?.trim().toLowerCase();

      return leads.find(l => {
        const phoneMatch = (Array.isArray(l.phones) && l.phones.includes(cleanPhone)) || l.phoneNumber === cleanPhone;
        const nameMatch = Boolean(cleanName) && l.name.toLowerCase() === cleanName;
        return phoneMatch || nameMatch;
      });
    },
    [leads]
  );

  const create = useCallback(
    async (data: CreateLeadInput): Promise<Lead> => {
      setLoading(true);
      try {
        const id = await upsertLeadLocal({
          name: data.name,
          businessType: data.businessType,
          phones: data.phones,
          location: data.location
        });

        await refreshLeads();
        runSyncWithRetry(1).catch(() => console.log("Background sync queued."));

        return {
          id,
          name: data.name,
          businessType: data.businessType || null,
          phones: data.phones,
          phoneNumber: data.phones?.[0]
        } as Lead;
      } catch {
        setError("Failed to create lead");
        throw new Error("Create failed");
      } finally {
        setLoading(false);
      }
    },
    [refreshLeads]
  );

  return (
    <leadsCtx.Provider value={{ leads, create, refreshLeads, findLeadsByPhone, checkDuplicate, loading, error }}>
      {children}
    </leadsCtx.Provider>
  );
}

export const useLeadsCtx = () => {
  const ctx = useContext(leadsCtx);
  if (!ctx) throw new Error("useLeadsCtx outside provider");
  return ctx;
};

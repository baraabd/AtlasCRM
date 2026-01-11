import { useState, useCallback, useEffect } from 'react';
import { queryAll, exec } from '../infra/db/db';
import { Lead } from '../types/domain';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryAll('SELECT * FROM leads ORDER BY createdAt DESC');
      
      const formatted = result.map((row: any) => ({
        ...row,
        // التعامل الآمن مع JSON
        phones: row.phones ? JSON.parse(row.phones) : [] 
      }));
      setLeads(formatted);
    } catch (e) {
      console.error("Fetch leads error:", e);
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLead = async (data: { name: string; businessType?: string; phones?: string[] }) => {
    setLoading(true);
    setError(null);
    try {
      const id = Math.random().toString(36).substring(7); // أو استخدم uuid مكتبة
      const now = new Date().toISOString();
      // تحويل المصفوفة لنص للتخزين
      const phonesJson = data.phones ? JSON.stringify(data.phones) : '[]';

      await exec(
        'INSERT INTO leads (id, name, businessType, phones, createdAt, updatedAt, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, data.name, data.businessType || null, phonesJson, now, now, 'pending']
      );
      
      await refresh();

      return {
        id,
        name: data.name,
        businessType: data.businessType,
        phones: data.phones,
        createdAt: now
      };
    } catch (e) {
      console.error("Create lead error:", e);
      setError("Failed to create lead");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { leads, loading, error, refresh, createLead };
}
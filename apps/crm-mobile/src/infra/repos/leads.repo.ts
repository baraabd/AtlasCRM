// apps/crm-mobile/src/infra/repos/leads.repo.ts

import { v4 as uuid } from 'uuid';
import { exec, queryAll, withTx } from '../db/db';
import { addSyncEvent } from './syncQueue.repo';

export async function listLeads() {
  console.log('[REPO] 🔍 Bringing customers from SQLite...');
  const rows = await queryAll<any>(`SELECT * FROM leads ORDER BY updatedAt DESC`);
  console.log(`[REPO] 📊 Locally discovered customers ${rows.length}`);
  return rows.map(r => ({
    ...r,
    phones: r.phones ? JSON.parse(r.phones) : [],
    consentMarketing: !!r.consentMarketing
  }));
}

export async function upsertLeadLocal(input: any) {
  const id = input.id ?? uuid();
  const now = new Date().toISOString();
  console.log(`[REPO] 💾 Attempting to save customer data: ${input.name} ID: ${id}`);

  try {
    await withTx(async () => {
      await exec(
        `INSERT INTO leads(id, name, businessType, phones, createdAt, updatedAt, syncStatus)
         VALUES(?, ?, ?, ?, ?, ?, 'pending')
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, phones=excluded.phones, updatedAt=excluded.updatedAt`,
        [id, input.name, input.businessType ?? null, JSON.stringify(input.phones || []), now, now]
      );

      await addSyncEvent({
        entityType: 'lead',
        entityLocalId: id,
        action: 'upsert',
        payload: { ...input, id, updatedAt: now }
      });
    });
    console.log('[REPO] ✅ Successfully saved in SQLite and synchronization event added.');
    return id;
  } catch (error) {
    console.error('[REPO] ❌ Local save failed:', error);
    throw error;
  }
}
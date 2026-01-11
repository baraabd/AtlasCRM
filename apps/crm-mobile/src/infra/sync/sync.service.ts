// apps/crm-mobile/src/infra/sync/sync.service.ts

import { endpoints } from '../api/endpoints';
import { getCursor, setCursor } from '../repos/meta.repo';
import { listPendingEvents, markSent } from '../repos/syncQueue.repo';

import { applyLeadFromServer, applyVisitFromServer } from './sync.apply';
import { httpPost } from './sync.http';

export async function runSync() {
  console.log('[SYNC] 🔄 Starting the synchronization cycle...');
  try {
    // 1. PUSH: إرسال التغييرات المحلية
    const pending = await listPendingEvents();
    console.log(`[SYNC] There are ${pending.length} events pending submission.`);
    
    for (const event of pending) {
      const res = await httpPost(endpoints.syncPush, { events: [event] });
      if (res.ok) {
        await markSent(event.eventId);
        console.log(`[SYNC] ✅ Event sent: ${event.eventId}`);
      }
    }

    // 2. PULL: جلب بيانات من السيرفر
    const cursor = await getCursor();
    const pullRes = await httpPost<any>(`${endpoints.syncPull}?cursor=${cursor || ''}`, {});

    if (pullRes.ok && pullRes.data) {
      const { leads, visits } = pullRes.data.changes;
      console.log(`[SYNC] ${leads?.length || 0} clients were fetched from the server.`);
      
      if (leads) for (const l of leads) await applyLeadFromServer(l);
      if (visits) for (const v of visits) await applyVisitFromServer(v);
      if (pullRes.data.nextCursor) await setCursor(pullRes.data.nextCursor);
    }

    console.log('[SYNC] ✅ Synced successfully.');
    return { ok: true };
  } catch (error: any) {
    console.error('[SYNC] ❌ Sync error:', error.message);
    throw error;
  }
}

// ✅ هذا هو الحل للخطأ في الصورة image_4c06fc.png
export async function runSyncWithRetry(retries = 3) {
  console.log(`[SYNC] Attempting to synchronize with ${retries} retries...`);
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await runSync();
    } catch (e) {
      attempt++;
      if (attempt >= retries) throw e;
    }
  }
}
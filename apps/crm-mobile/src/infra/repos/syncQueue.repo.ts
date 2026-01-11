import { v4 as uuid } from 'uuid';
import { db } from '../db/db'; // الربط مع المحرك الموحد

export type SyncQueueStatus = 'pending' | 'sent' | 'failed';

export type SyncQueueRow = {
  eventId: string;
  entityType: 'lead' | 'visit';
  entityLocalId: string;
  action: 'upsert' | 'delete';
  payload: string;
  status: SyncQueueStatus;
  createdAt: string;
};

/**
 * إضافة حدث جديد لطابور المزامنة
 * تم تعديل أسماء الأعمدة لتطابق الهيكل الجديد (camelCase)
 */

export async function markRetry(eventId: string, error: string) {
  try {
    // نقوم بتحديث الحالة إلى 'pending' لكي تحاول المزامنة مرة أخرى في الدورة القادمة
    await db.runAsync(
      `UPDATE sync_queue SET status = 'pending' WHERE eventId = ?`,
      [eventId]
    );
  } catch (e) {
    console.error('❌ Failed to mark retry:', e);
  }
}

export async function addSyncEvent(input: {
  entityType: 'lead' | 'visit';
  entityLocalId: string;
  action: 'upsert' | 'delete';
  payload: unknown;
}) {
  const now = new Date().toISOString();
  const eventId = uuid();

  try {
    await db.runAsync(
      `INSERT INTO sync_queue (
        eventId, entityType, entityLocalId, action, payload, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        input.entityType,
        input.entityLocalId,
        input.action,
        JSON.stringify(input.payload),
        'pending',
        now
      ]
    );
    console.log(`✅ Sync event added: ${input.entityType} - ${input.action}`);
  } catch (error) {
    console.error('❌ Failed to add sync event:', error);
    throw error;
  }
}

/**
 * جلب الأحداث التي تنتظر الإرسال
 */
export async function listPendingEvents(limit = 50): Promise<SyncQueueRow[]> {
  try {
    const results = await db.getAllAsync(
      `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY createdAt ASC LIMIT ?`,
      [limit]
    );
    return results as SyncQueueRow[];
  } catch (error) {
    console.error('❌ Failed to list pending events:', error);
    return [];
  }
}

/**
 * تحديث حالة الحدث بعد الإرسال الناجح
 */
export async function markSent(eventId: string): Promise<void> {
  try {
    await db.runAsync(
      `UPDATE sync_queue SET status = 'sent' WHERE eventId = ?`,
      [eventId]
    );
  } catch (error) {
    console.error('❌ Failed to mark event as sent:', error);
  }
}

/**
 * تحديث الحالة في حال الفشل
 */
export async function markFailed(eventId: string) {
  try {
    await db.runAsync(
      `UPDATE sync_queue SET status = 'failed' WHERE eventId = ?`,
      [eventId]
    );
  } catch (error) {
    console.error('❌ Failed to mark event as failed:', error);
  }
}
import { v4 as uuid } from 'uuid';

import { db } from '../db/db'; // تأكد من الاستيراد من المحرك الموحد

// أنواع البيانات المحدثة لتطابق CamelCase
type LeadLookup = { id: string; updatedAt: string; syncStatus: string };
type VisitLookup = { id: string; updatedAt: string; syncStatus: string };

function isoFromServerTime(serverTime: number | string) {
  if (typeof serverTime === 'number') return new Date(serverTime).toISOString();
  return serverTime;
}

export async function markLeadSynced(id: string, serverTime: number | string) {
  const now = isoFromServerTime(serverTime);
  await db.runAsync(`UPDATE leads SET syncStatus='synced', updatedAt=? WHERE id=?`, [now, id]);
}

export async function markVisitSynced(id: string, serverTime: number | string) {
  const now = isoFromServerTime(serverTime);
  await db.runAsync(`UPDATE visits SET syncStatus='synced', updatedAt=? WHERE id=?`, [now, id]);
}

export async function applyLeadFromServer(row: any) {
  const updatedAt = isoFromServerTime(row.updatedAt);

  // البحث عن العميل باستخدام الـ id (الذي يمثل localId) أو إضافة حقل serverId إذا كان موجوداً
  // ملاحظة: في الميجريشن الخاص بك، تأكد أنك تستخدم id كـ Primary Key
  const existing = await db.getFirstAsync<LeadLookup>(
    `SELECT id, updatedAt, syncStatus FROM leads WHERE id=?`,
    [row.id || row.serverId]
  );

  // منطق LWW (Last Write Wins)
  if (existing?.syncStatus === 'pending' && existing.updatedAt > updatedAt) return;

  const localId = existing?.id ?? (row.id || uuid());

  await db.runAsync(
    `INSERT INTO leads(
      id, name, businessType, phone, address, syncStatus, createdAt, updatedAt
    )
    VALUES(?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      businessType=excluded.businessType,
      phone=excluded.phone,
      address=excluded.address,
      syncStatus='synced',
      updatedAt=excluded.updatedAt`,
    [
      localId,
      row.name,
      row.businessType ?? null,
      row.phone ?? null,
      row.address ?? null,
      'synced',
      updatedAt,
      updatedAt
    ]
  );
}

export async function applyVisitFromServer(row: any) {
  const updatedAt = isoFromServerTime(row.updatedAt);

  const existing = await db.getFirstAsync<VisitLookup>(
    `SELECT id, updatedAt, syncStatus FROM visits WHERE id=?`,
    [row.id || row.serverId]
  );

  if (existing?.syncStatus === 'pending' && existing.updatedAt > updatedAt) return;

  const localId = existing?.id ?? (row.id || uuid());
  const leadId = row.leadId || row.leadLocalId;

  if (!leadId) return; // لا يمكن إضافة زيارة بدون عميل
  console.warn

  await db.runAsync(
    `INSERT INTO visits(
      id, leadId, startedAt, endedAt, notes, syncStatus
    )
    VALUES(?,?,?,?,?, 'synced')
    ON CONFLICT(id) DO UPDATE SET
      leadId=excluded.leadId,
      startedAt=excluded.startedAt,
      endedAt=excluded.endedAt,
      notes=excluded.notes,
      syncStatus='synced'`,
    [
      localId,
      leadId,
      row.startedAt,
      row.endedAt ?? null,
      row.notes ?? null
    ]
  );
}
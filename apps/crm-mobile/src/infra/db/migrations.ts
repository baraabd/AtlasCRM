import { db } from './db';

export async function runMigrations() {
  console.log('[Migrations] Starting...');

  // 1. جدول العملاء (شامل لجميع الحقول المطلوبة)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY NOT NULL,        -- هو نفسه localId
      serverId TEXT,                       -- للربط مع السيرفر
      name TEXT NOT NULL,
      businessType TEXT,
      ownerName TEXT,
      phones TEXT,                         -- تخزين مصفوفة أرقام بتنسيق JSON
      address TEXT,
      lat REAL,
      lng REAL,
      notes TEXT,
      consentMarketing INTEGER DEFAULT 0,
      syncStatus TEXT NOT NULL DEFAULT 'pending', -- pending | synced | failed
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 2. جدول الزيارات
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY NOT NULL,
      leadId TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT,
      outcome TEXT,
      notes TEXT,
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (leadId) REFERENCES leads (id) ON DELETE CASCADE
    );
  `);

  // 3. الجداول التقنية (Meta, Sync Queue, Dashboard)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);

    CREATE TABLE IF NOT EXISTS sync_queue (
      eventId TEXT PRIMARY KEY NOT NULL,
      entityType TEXT NOT NULL,
      entityLocalId TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dashboard_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Migrations Applied Successfully');
}
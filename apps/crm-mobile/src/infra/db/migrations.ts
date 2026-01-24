import { db } from './db';

export async function runMigrations() {
  console.log('[Migrations] Starting...');

  // تأكد من مسح الجداول القديمة إذا تغير الهيكل بشكل جذري (أثناء التطوير فقط)
  // await db.execAsync('DROP TABLE IF EXISTS leads; DROP TABLE IF EXISTS sync_queue;');

  // 1. جدول العملاء (Leads)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      businessType TEXT,
      phones TEXT,                -- JSON Array string
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  // 2. جدول الزيارات (Visits)
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

  // 3. جدول المزامنة (Sync Queue)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      eventId TEXT PRIMARY KEY NOT NULL,
      entityType TEXT NOT NULL,
      entityLocalId TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL
    );
  `);

  // 4. جدول الميتا (Meta)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
  `);

  console.log('✅ Migrations Applied Successfully');
}
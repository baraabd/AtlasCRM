import * as SQLite from 'expo-sqlite';

import { DB_NAME, MIGRATIONS, SCHEMA_VERSION } from './schema';

export type Db = SQLite.SQLiteDatabase;

export async function openDb(): Promise<Db> {
  return SQLite.openDatabaseAsync(DB_NAME);
}

async function getMeta(db: Db, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [
    key,
  ]);
  return row?.value ?? null;
}

async function setMeta(db: Db, key: string, value: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO meta(key,value) VALUES(?,?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, value],
  );
}

export async function migrate(db: Db): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // ✅ Ensure meta exists BEFORE any reads from it
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const currentRaw = await getMeta(db, 'schema_version');
  const current = currentRaw ? Number(currentRaw) : 0;

  for (const m of MIGRATIONS) {
    if (m.version > current) {
      await db.execAsync('BEGIN;');
      try {
        for (const sql of m.sql) await db.execAsync(sql);
        await setMeta(db, 'schema_version', String(m.version));
        await db.execAsync('COMMIT;');
      } catch (e) {
        await db.execAsync('ROLLBACK;');
        throw e;
      }
    }
  }

  // Keep as a final guard
  await setMeta(db, 'schema_version', String(SCHEMA_VERSION));
}

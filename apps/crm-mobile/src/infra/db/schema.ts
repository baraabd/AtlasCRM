export const schemaSql = [
  // meta: لتخزين cursor وغيره
  `CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
  );`,

  // leads
  `CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    businessType TEXT,
    phone TEXT,
    address TEXT,
    syncStatus TEXT NOT NULL DEFAULT 'synced', -- pending|synced|failed
    updatedAtLocal INTEGER NOT NULL,
    updatedAtServer INTEGER,
    deletedAt INTEGER
  );`,

  // visits (أساس)
  `CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY NOT NULL,
    leadId TEXT NOT NULL,
    startedAtLocal INTEGER NOT NULL,
    endedAtLocal INTEGER,
    outcome TEXT,
    notes TEXT,
    presented TEXT,
    durationSec INTEGER,
    syncStatus TEXT NOT NULL DEFAULT 'synced',
    updatedAtLocal INTEGER NOT NULL,
    updatedAtServer INTEGER,
    deletedAt INTEGER
  );`,

  
  `CREATE INDEX IF NOT EXISTS idxOutboxStatus ON outbox(status, clientTimestamp);`,
  `CREATE INDEX IF NOT EXISTS idxLeadsDeleted ON leads(deletedAt);`,
  `CREATE INDEX IF NOT EXISTS idxVisitsLead ON visits(leadId);`,
];

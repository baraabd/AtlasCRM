export const DB_NAME = 'crm.db';
export const SCHEMA_VERSION = 1;

export const MIGRATIONS: Array<{ version: number; sql: string[] }> = [
  {
    version: 1,
    sql: [
      `CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );`,

      `CREATE TABLE IF NOT EXISTS leads (
        local_id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT,
        name TEXT NOT NULL,
        business_type TEXT,
        owner_name TEXT,
        phone TEXT,
        address TEXT,
        lat REAL,
        lng REAL,
        notes TEXT,
        consent_marketing INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );`,

      `CREATE TABLE IF NOT EXISTS visits (
        local_id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT,
        lead_local_id TEXT NOT NULL,
        lead_server_id TEXT,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        result TEXT,
        notes TEXT,
        lat REAL,
        lng REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (lead_local_id) REFERENCES leads(local_id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS work_sessions (
        local_id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT,
        clock_in_at TEXT NOT NULL,
        clock_out_at TEXT,
        break_minutes INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );`,

      `CREATE TABLE IF NOT EXISTS media (
        local_id TEXT PRIMARY KEY NOT NULL,
        server_id TEXT,
        entity_type TEXT NOT NULL,
        entity_local_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        mime_type TEXT,
        size_bytes INTEGER,
        created_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );`,

      `CREATE TABLE IF NOT EXISTS id_map (
        entity_type TEXT NOT NULL,
        local_id TEXT NOT NULL,
        server_id TEXT NOT NULL,
        PRIMARY KEY (entity_type, local_id)
      );`,

      `CREATE TABLE IF NOT EXISTS sync_queue (
        event_id TEXT PRIMARY KEY NOT NULL,
        device_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_local_id TEXT NOT NULL,
        action TEXT NOT NULL,
        depends_on_event_id TEXT,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,

      `CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);`,
      `CREATE INDEX IF NOT EXISTS idx_visits_lead_local_id ON visits(lead_local_id);`
    ],
  },
];

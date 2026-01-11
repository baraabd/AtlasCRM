import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

import { exec, queryOne } from '../db/db';

type MetaRow = { value: string | null };

export async function getMeta(key: string): Promise<string | null> {
  const row = await queryOne<MetaRow>(`SELECT value FROM meta WHERE key=?`, [key]);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string | null): Promise<void> {
  await exec(
    `INSERT INTO meta(key, value) VALUES(?,?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, value],
  );
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getMeta('deviceId');
  if (existing) return existing;

  const id = uuid();
  await setMeta('deviceId', id);
  return id;
}

export async function getCursor(): Promise<string | null> {
  return getMeta('syncCursor');
}

export async function setCursor(cursor: string): Promise<void> {
  await setMeta('syncCursor', cursor);
}

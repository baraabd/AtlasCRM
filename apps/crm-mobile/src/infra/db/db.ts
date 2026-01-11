import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('crm_V1.db');

export async function initDb() {
  await db.execAsync('PRAGMA foreign_keys = ON;');
}

export const exec = (sql: string, params: any[] = []) => db.runAsync(sql, params);
export const queryAll = <T>(sql: string, params: any[] = []) => db.getAllAsync(sql, params) as Promise<T[]>;
export const queryOne = <T>(sql: string, params: any[] = []) => db.getFirstAsync(sql, params) as Promise<T | null>;

// إضافة دالة المعاملات (Transaction) لأنها مستخدمة في Repo
export async function withTx(callback: () => Promise<void>) {
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await callback();
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}
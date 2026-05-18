import path from "node:path";
import { DatabaseSync } from "node:sqlite";

interface Statement {
  all(...params: unknown[]): Record<string, unknown>[];
  get(...params: unknown[]): Record<string, unknown> | undefined;
  run(...params: unknown[]): unknown;
}

interface Database {
  exec(sql: string): unknown;
  prepare(sql: string): Statement;
}

const globalForDb = globalThis as typeof globalThis & {
  medicalInventoryDb?: Database;
};

export function getDb() {
  if (!globalForDb.medicalInventoryDb) {
    globalForDb.medicalInventoryDb = new DatabaseSync(path.join(process.cwd(), "dev.db")) as Database;
    globalForDb.medicalInventoryDb.exec("PRAGMA foreign_keys = ON");
  }

  return globalForDb.medicalInventoryDb;
}

export function createId() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

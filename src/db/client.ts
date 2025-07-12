import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { tables } from "./schema";

const databasePath = "./sqlite/dev.db";

const sqlite = new Database(databasePath);
export const db = drizzle(sqlite, { schema: tables });

export function getDb() {
  return db;
}

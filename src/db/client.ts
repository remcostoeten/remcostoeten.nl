import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { tables } from "./schema";
import { config } from "dotenv";

// Load environment variables
config();

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema: tables });

export function getDb() {
  return db;
}

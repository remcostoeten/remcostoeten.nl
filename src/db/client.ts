import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function createDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!url) {
    throw new Error("DATABASE_URL (or POSTGRES_URL/POSTGRES_PRISMA_URL) is not set");
  }
  const sql = neon(url);
  return drizzle({ client: sql });
}

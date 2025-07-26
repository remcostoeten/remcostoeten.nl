import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

function createConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(connectionString, {
    max: 20, // Increased pool size for analytics queries
    idle_timeout: 30, // Keep connections alive longer
    connect_timeout: 10,
    max_lifetime: 60 * 30, // 30 minutes
    prepare: false, // Disable prepared statements for analytics queries
    transform: {
      undefined: null,
    },
  });

  return drizzle(client, { schema });
}

export const db = createConnection();

export type TDatabase = typeof db;

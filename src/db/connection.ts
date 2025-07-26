import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import * as schema from "./schema";

config();

type TDatabaseConfig = {
  url: string;
  max?: number;
  idle_timeout?: number;
  connect_timeout?: number;
};

function createDatabaseConnection(config: TDatabaseConfig) {
  const client = postgres(config.url, {
    max: config.max || 10,
    idle_timeout: config.idle_timeout || 20,
    connect_timeout: config.connect_timeout || 10,
  });
  
  return drizzle(client, { schema });
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return url;
}

export function getDatabase() {
  const config: TDatabaseConfig = {
    url: getDatabaseUrl(),
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  };
  
  return createDatabaseConnection(config);
}

export const db = getDatabase();

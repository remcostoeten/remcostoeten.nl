import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Global connection cache for serverless environments
let globalConnection: ReturnType<typeof drizzle> | undefined;

function createConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // For serverless environments, use a simpler configuration
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  const client = postgres(connectionString, {
    max: isServerless ? 1 : 20, // Single connection in serverless
    idle_timeout: isServerless ? 0 : 30,
    connect_timeout: 10,
    max_lifetime: isServerless ? 0 : 60 * 30,
    prepare: false,
    transform: {
      undefined: null,
    },
  });

  return drizzle(client, { schema });
}

export function getDb() {
  if (!globalConnection) {
    globalConnection = createConnection();
  }
  return globalConnection;
}

// Keep the old export for backward compatibility but make it lazy
export const db = getDb();

export type TDatabase = typeof db;

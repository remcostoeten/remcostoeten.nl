import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { tables } from "./schema";

// Load environment variables
config();

let _db: ReturnType<typeof drizzle> | null = null;

function createDatabase() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL environment variable is required");
	}

	// Handle both local SQLite and Turso URLs
	const isLocalDb = process.env.DATABASE_URL.startsWith("file:");
	
	const client = createClient({
		url: process.env.DATABASE_URL,
		// Only use auth token for Turso (remote) databases
		authToken: isLocalDb ? undefined : process.env.TURSO_AUTH_TOKEN,
	});

	return drizzle(client, { schema: tables });
}

export function getDb() {
	if (!_db) {
		_db = createDatabase();
	}
	return _db;
}

// For backwards compatibility, export db as getDb()
export const db = getDb;

export { tables };

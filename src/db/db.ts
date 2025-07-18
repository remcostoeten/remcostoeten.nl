import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/api/env";

function createDatabaseClient() {
	try {
		const client = createClient({
			url: env.TURSO_DATABASE_URL!,
			authToken: env.TURSO_AUTH_TOKEN!,
		});

		return drizzle({ client });
	} catch (error) {
		console.error("Failed to create database client:", error);
		throw error;
	}
}

// Create database client lazily to avoid client-side execution
let _db: ReturnType<typeof createDatabaseClient> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDatabaseClient>, {
	get(_target, prop) {
		if (typeof window !== "undefined") {
			throw new Error("Database client cannot be used on the client side");
		}

		if (!_db) {
			_db = createDatabaseClient();
		}

		return _db[prop as keyof typeof _db];
	},
});

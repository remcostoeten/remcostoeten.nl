import { drizzle } from "drizzle-orm/libsql";
import { Env } from "@/api/env";
import { Users } from "./schemas/users";

async function main() {
	const db = drizzle({
		connection: {
			url: Env.TURSO_DATABASE_URL!,
			authToken: Env.TURSO_AUTH_TOKEN!,
		},
	});

	const user: typeof Users.$inferInsert = {
		name: "peter",
		email: "n@example.com",
	};

	await db.insert(Users).values(user);
	console.log("New user created!");

	const allUsers = await db.select().from(Users);
	console.log("Getting all users from the database: ", allUsers);
}

main();

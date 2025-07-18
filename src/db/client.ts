import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/api/env";
import { users } from "./schemas/users";

async function main() {
	const db = drizzle({
		connection: {
			url: env.TURSO_DATABASE_URL!,
			authToken: env.TURSO_AUTH_TOKEN!,
		},
	});

	const user: typeof users.$inferInsert = {
		name: "peter",
		email: "n@example.com",
		password: "hashedpassword123",
	};

	await db.insert(users).values(user);
	console.log("New user created!");

	const allUsers = await db.select().from(users);
	console.log("Getting all users from the database: ", allUsers);
}

main();

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { users } from './schemas/users';

async function main() {
	const db = drizzle({
		connection: {
			url: process.env.TURSO_DATABASE_URL!,
			authToken: process.env.TURSO_AUTH_TOKEN!
		}
	});
	const user: typeof users.$inferInsert = {
		name: 'peter',
		email: 'n@example.com',
	};
	await db.insert(users).values(user);
	console.log('New user created!');
	const allUsers = await db.select().from(users);
	console.log('Getting all users from the database: ', allUsers);
}
main();

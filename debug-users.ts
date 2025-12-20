import { db } from './src/server/db/connection';
import * as authSchema from './src/server/db/auth-schema';

async function main() {
    try {
        const users = await db.select().from(authSchema.user);
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role})`);
        });
    } catch (e) {
        console.error('Error querying users:', e);
    }
}

main();

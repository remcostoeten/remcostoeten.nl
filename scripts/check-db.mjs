import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { sql } from 'drizzle-orm'


const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

async function checkDatabase() {
    try {
        console.log('📊 Activity Sync Status:');

        const githubRes = await db.execute(sql`SELECT count(*) FROM github_activities`);
        const spotifyRes = await db.execute(sql`SELECT count(*) FROM spotify_listens`);
        const metaRes = await db.execute(sql`SELECT * FROM sync_metadata`);

        const githubCount = githubRes.rows[0]?.count || 0;
        const spotifyCount = spotifyRes.rows[0]?.count || 0;

        console.log(`- GitHub Activities: ${githubCount}`);
        console.log(`- Spotify Listens:    ${spotifyCount}`);

        if (metaRes.rows.length > 0) {
            console.log('\n📅 Last Sync Times:');
            console.table(metaRes.rows);
        } else {
            console.log('\n📅 No sync metadata found yet (run a sync first).');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error);
        process.exit(1);
    }
}

checkDatabase().catch(err => {
    console.error(err);
    process.exit(1);
});

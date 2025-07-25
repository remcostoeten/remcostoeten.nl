import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

async function fixAnalyticsSchema() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('🔧 Adding missing columns to analytics_events table...');
    
    // Add the missing columns with IF NOT EXISTS to avoid errors if they already exist
    const queries = [
      `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country varchar(100);`,
      `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS region varchar(100);`,
      `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS city varchar(100);`,
      `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS latitude varchar(50);`,
      `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS longitude varchar(50);`
    ];

    for (const query of queries) {
      console.log(`Running: ${query}`);
      await client.unsafe(query);
    }

    console.log('✅ Successfully added missing columns to analytics_events table');
  } catch (error) {
    console.error('❌ Error fixing analytics schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAnalyticsSchema()
    .then(() => {
      console.log('🎉 Schema fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema fix failed:', error);
      process.exit(1);
    });
}

export { fixAnalyticsSchema };

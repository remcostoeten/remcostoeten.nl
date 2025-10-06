import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../schema';

const storageType = process.env.STORAGE_TYPE || 'memory';
const databaseUrl = process.env.DATABASE_URL;
let db: any = null;
let sql: any = null;

if (storageType === 'postgres' && databaseUrl) {
  try {
    sql = neon(databaseUrl);
    db = drizzle(sql, { schema, logger: true });
    console.log('✅ Database configured successfully');
  } catch (error) {
    console.warn('⚠️ Database configuration failed, using memory storage:', error);
  }
} else {
  console.log('ℹ️ Using memory storage (STORAGE_TYPE != postgres or no DATABASE_URL)');
}

export { db };

export async function initializeDatabase() {
  if (storageType !== 'postgres' || !databaseUrl || !sql) {
    console.log('ℹ️ Skipping database initialization - using memory storage');
    return;
  }

  try {
    // Test database connection
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

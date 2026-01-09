import { db } from '../db';

export async function testDatabaseConnection() {
  try {
    // Simple test query to check if database is working
    const result = await db.run('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    return { success: true, result };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  }
}

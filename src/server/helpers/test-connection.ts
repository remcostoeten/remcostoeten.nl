/**
 * Test the database connection
 * @returns {Promise<{success: boolean, message: string, error?: Error}>}
 */

import { client } from '@/server/db';

export async function testConnection() {
  try {
    await client`SELECT 1`;
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { success: false, message: 'Database connection failed', error };
  }
}
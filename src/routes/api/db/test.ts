import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { db } from '~/db/connection';
import { sql } from 'drizzle-orm';

export async function GET(event: APIEvent) {
  try {
    // Test basic connection
    const connectionTest = await db.execute(sql`SELECT 1 as test`);
    
    // Test table existence
    const tableTest = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    // Get basic stats
    const adminUserCount = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM admin_user
    `);
    
    const projectCount = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM projects
    `);

    return json({
      success: true,
      message: 'Database connection successful',
      data: {
        connection: connectionTest.length > 0 ? 'OK' : 'FAILED',
        timestamp: new Date().toISOString(),
        tables: tableTest.map(t => t.table_name),
        stats: {
          adminUsers: adminUserCount[0]?.count || 0,
          projects: projectCount[0]?.count || 0,
        }
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

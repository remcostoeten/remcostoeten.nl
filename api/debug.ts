import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    // Test basic DB connection
    let dbTest = 'not_tested';
    let dbInitTest = 'not_tested';
    let dbModule: any = null;
    
    try {
      // Try to import database modules
      const dbConnection = await import('../src/db/connection.js');
      const { analyticsEvents } = await import('../src/db/schema.js');
      const { sql } = await import('drizzle-orm');
      
      dbModule = dbConnection.db;
      dbInitTest = 'modules_loaded';
      
      if (hasDbUrl && dbModule) {
        const result = await dbModule.execute(sql`SELECT NOW() as current_time`);
        dbTest = 'connected';
      } else {
        dbTest = hasDbUrl ? 'no_db_instance' : 'no_db_url';
      }
    } catch (error) {
      dbTest = `error: ${error instanceof Error ? error.message : 'unknown'}`;
      dbInitTest = `init_error: ${error instanceof Error ? error.message : 'unknown'}`;
    }
    
    return res.status(200).json({
      status: 'debug',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: nodeEnv,
        has_database_url: hasDbUrl,
        db_init_test: dbInitTest,
        db_test: dbTest,
        vercel_region: process.env.VERCEL_REGION || 'unknown',
        runtime: 'nodejs'
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'unknown error'
    });
  }
}

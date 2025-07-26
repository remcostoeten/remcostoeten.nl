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
    // Import database modules dynamically
const { getDb } = await import('../../src/db/connection.js');
    const db = getDb();
    const { analyticsEvents } = await import('../../src/db/schema.js');
    const { eq, desc, gte, sql } = await import('drizzle-orm');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const [activeUsers, currentPageViews, recentEvents] = await Promise.all([
      // Active users
      db.selectDistinct({ sessionId: analyticsEvents.sessionId })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, fiveMinutesAgo)),
      
      // Current page views  
      db.select({
        page: analyticsEvents.page,
        activeUsers: sql`COUNT(DISTINCT ${analyticsEvents.sessionId})`.as('activeUsers')
      })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventType, 'page_view'))
        .where(gte(analyticsEvents.timestamp, fiveMinutesAgo))
        .groupBy(analyticsEvents.page),
      
      // Recent events
      db.select()
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, fiveMinutesAgo))
        .orderBy(desc(analyticsEvents.timestamp))
        .limit(20)
    ]);

    const result = {
      activeUsers: activeUsers.length,
      currentPageViews: currentPageViews.map(p => ({
        page: p.page || 'Unknown',
        activeUsers: Number(p.activeUsers)
      })),
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        eventType: event.eventType,
        page: event.page || undefined,
        referrer: event.referrer || undefined,
        userAgent: event.userAgent || undefined,
        ipAddress: event.ipAddress || undefined,
        sessionId: event.sessionId || undefined,
        data: event.data,
        timestamp: event.timestamp
      }))
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to fetch real-time metrics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch real-time metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

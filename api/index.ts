import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';

// Try to import database safely
let db: any;
let analyticsEvents: any;
let eq: any, desc: any, count: any, and: any, gte: any, lte: any, sql: any;

try {
  const dbModule = require('../src/db/connection');
  const schemaModule = require('../src/db/schema');
  const drizzleOrm = require('drizzle-orm');
  
  db = dbModule.db;
  analyticsEvents = schemaModule.analyticsEvents;
  ({ eq, desc, count, and, gte, lte, sql } = drizzleOrm);
} catch (error) {
  console.error('Failed to import database modules:', error);
}
// Analytics types defined directly
type AnalyticsEvent = {
  id: string;
  eventType: string;
  page?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  userId?: string;
  data?: any;
  timestamp: Date;
};

type AnalyticsMetrics = {
  totalPageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  topPages: { page: string; views: number }[];
  topReferrers: { referrer: string; visits: number }[];
  deviceTypes: { type: string; count: number }[];
  popularProjects: { projectId: string; projectTitle: string; views: number }[];
  contactFormStats: { submissions: number; successRate: number };
  hourlyActivity: { hour: number; count: number }[];
  dailyActivity: { date: string; pageViews: number; uniqueVisitors: number }[];
  topCountries: { country: string; visits: number; percentage: number }[];
  topRegions: { region: string; country: string; visits: number }[];
  topCities: { city: string; region: string; country: string; visits: number }[];
};

type AnalyticsFilters = {
  startDate?: Date;
  endDate?: Date;
  page?: string;
  eventType?: string;
};

type RealTimeMetrics = {
  activeUsers: number;
  currentPageViews: { page: string; activeUsers: number }[];
  recentEvents: AnalyticsEvent[];
};

// Simple IP geolocation function using ipapi.co
async function getLocationFromIP(ip: string): Promise<{
  country?: string;
  region?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
}> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    return {};
  }

  try {
    // Use ipapi.co for basic geolocation (free tier)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      return {};
    }
    
    const data = await response.json();
    return {
      country: data.country_name || undefined,
      region: data.region || undefined,
      city: data.city || undefined,
      latitude: data.latitude ? String(data.latitude) : undefined,
      longitude: data.longitude ? String(data.longitude) : undefined,
    };
  } catch (error) {
    console.error('Failed to get location from IP:', error);
    return {};
  }
}

const app = new Hono();

app.use('/*', cors({
  origin: '*', // Allow all origins for now
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// POST /api/analytics/events
app.post('/analytics/events', async (c) => {
  try {
    const event: Omit<AnalyticsEvent, 'id' | 'timestamp'> = await c.req.json();
    
    // Get client info from headers
    const clientIP = c.req.header('x-forwarded-for')?.split(',')[0] || 
                    c.req.header('x-real-ip') || 
                    'unknown';
    const userAgent = c.req.header('user-agent') || '';

    // Get geographic data from IP (only for page views to reduce API calls)
    let locationData = {};
    if (event.eventType === 'page_view' || event.eventType === 'session_start') {
      locationData = await getLocationFromIP(clientIP);
    }

    await db.insert(analyticsEvents).values({
      eventType: event.eventType,
      page: event.page,
      referrer: event.referrer,
      userAgent,
      ipAddress: clientIP,
      sessionId: event.sessionId,
      userId: event.userId,
      data: event.data,
      ...locationData,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to track event:', error);
    return c.json({ error: 'Failed to track event' }, 500);
  }
});

// GET /api/analytics/metrics
app.get('/analytics/metrics', async (c) => {
  try {
    const filters: AnalyticsFilters = {
      startDate: c.req.query('startDate') ? new Date(c.req.query('startDate')!) : undefined,
      endDate: c.req.query('endDate') ? new Date(c.req.query('endDate')!) : undefined,
      page: c.req.query('page') || undefined,
      eventType: c.req.query('eventType') || undefined,
    };

    const metrics = await getMetrics(filters);
    return c.json(metrics);
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return c.json({ error: 'Failed to fetch metrics' }, 500);
  }
});

// GET /api/analytics/realtime
app.get('/analytics/realtime', async (c) => {
  try {
    const realTimeMetrics = await getRealTimeMetrics();
    return c.json(realTimeMetrics);
  } catch (error) {
    console.error('Failed to fetch real-time metrics:', error);
    return c.json({ error: 'Failed to fetch real-time metrics' }, 500);
  }
});

// GET /api/analytics/events
app.get('/analytics/events', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const filters: AnalyticsFilters = {
      startDate: c.req.query('startDate') ? new Date(c.req.query('startDate')!) : undefined,
      endDate: c.req.query('endDate') ? new Date(c.req.query('endDate')!) : undefined,
      page: c.req.query('filterPage') || undefined,
      eventType: c.req.query('eventType') || undefined,
    };

    const events = await getEvents(page, limit, filters);
    return c.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/debug', async (c) => {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    // Test basic DB connection
    let dbTest = 'not_tested';
    try {
      if (hasDbUrl) {
        const result = await db.execute(`SELECT NOW() as current_time`);
        dbTest = 'connected';
      } else {
        dbTest = 'no_db_url';
      }
    } catch (error) {
      dbTest = `error: ${error instanceof Error ? error.message : 'unknown'}`;
    }
    
    return c.json({
      status: 'debug',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: nodeEnv,
        has_database_url: hasDbUrl,
        db_test: dbTest
      }
    });
  } catch (error) {
    return c.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'unknown error'
    }, 500);
  }
});

async function getMetrics(filters?: AnalyticsFilters): Promise<AnalyticsMetrics> {
  const whereConditions = [];
  
  if (filters?.startDate) {
    whereConditions.push(gte(analyticsEvents.timestamp, filters.startDate));
  }
  
  if (filters?.endDate) {
    whereConditions.push(lte(analyticsEvents.timestamp, filters.endDate));
  }
  
  if (filters?.page) {
    whereConditions.push(eq(analyticsEvents.page, filters.page));
  }
  
  if (filters?.eventType) {
    whereConditions.push(eq(analyticsEvents.eventType, filters.eventType));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [
    totalPageViews,
    uniqueVisitors,
    sessionDurations,
    ,
    topPages,
    topReferrers,
    popularProjects,
    contactFormSubmissions,
    successfulSubmissions,
    hourlyActivity,
    dailyActivity,
    userAgents,
    topCountries,
    topRegions,
    topCities
  ] = await Promise.all([
    // Total page views
    db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'page_view'), whereClause)),
    
    // Unique visitors
    db.selectDistinct({ sessionId: analyticsEvents.sessionId })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'page_view'), whereClause)),
    
    // Session durations
    db.select({
      sessionId: analyticsEvents.sessionId,
      minTime: sql`MIN(${analyticsEvents.timestamp})`.as('minTime'),
      maxTime: sql`MAX(${analyticsEvents.timestamp})`.as('maxTime'),
      duration: sql`EXTRACT(EPOCH FROM (MAX(${analyticsEvents.timestamp}) - MIN(${analyticsEvents.timestamp})))`.as('duration')
    })
      .from(analyticsEvents)
      .where(whereClause)
      .groupBy(analyticsEvents.sessionId)
      .having(sql`COUNT(*) > 1`),
    
    // Bounce rate (sessions with only 1 page view)
    db.select({
      totalSessions: sql`COUNT(DISTINCT ${analyticsEvents.sessionId})`.as('totalSessions'),
      bouncedSessions: sql`COUNT(DISTINCT CASE WHEN single_page.page_count = 1 THEN ${analyticsEvents.sessionId} END)`.as('bouncedSessions')
    })
      .from(analyticsEvents)
      .leftJoin(
        sql`(
          SELECT session_id, COUNT(*) as page_count 
          FROM analytics_events 
          WHERE event_type = 'page_view' 
          GROUP BY session_id
        ) single_page`,
        sql`${analyticsEvents.sessionId} = single_page.session_id`
      )
      .where(and(eq(analyticsEvents.eventType, 'page_view'), whereClause)),
    
    // Top pages
    db.select({ page: analyticsEvents.page, views: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'page_view'), whereClause))
      .groupBy(analyticsEvents.page)
      .orderBy(desc(count()))
      .limit(10),
    
    // Top referrers
    db.select({ referrer: analyticsEvents.referrer, visits: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'page_view'), whereClause))
      .groupBy(analyticsEvents.referrer)
      .orderBy(desc(count()))
      .limit(10),
    
    // Popular projects
    db.select({ data: analyticsEvents.data, views: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'project_view'), whereClause))
      .groupBy(analyticsEvents.data)
      .orderBy(desc(count()))
      .limit(10),
    
    // Contact form submissions
    db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'contact_form_submission'), whereClause)),
    
    // Successful submissions
    db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'contact_form_submission'),
        sql`${analyticsEvents.data}->>'success' = 'true'`,
        whereClause
      )),
    
    // Hourly activity
    db.select({
      hour: sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`.as('hour'),
      count: count()
    })
      .from(analyticsEvents)
      .where(whereClause)
      .groupBy(sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`),
    
    // Daily activity
    db.select({
      date: sql`DATE(${analyticsEvents.timestamp})`.as('date'),
      pageViews: count(),
      uniqueVisitors: sql`COUNT(DISTINCT ${analyticsEvents.sessionId})`.as('uniqueVisitors')
    })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        gte(analyticsEvents.timestamp, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        whereClause
      ))
      .groupBy(sql`DATE(${analyticsEvents.timestamp})`)
      .orderBy(sql`DATE(${analyticsEvents.timestamp})`),
    
    // User agents for device categorization
    db.select({ userAgent: analyticsEvents.userAgent })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'session_start'), whereClause)),
    
    // Top countries
    db.select({ 
      country: analyticsEvents.country, 
      visits: count(),
      totalVisits: sql`SUM(COUNT(*)) OVER()`.as('totalVisits')
    })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'), 
        sql`${analyticsEvents.country} IS NOT NULL`,
        whereClause
      ))
      .groupBy(analyticsEvents.country)
      .orderBy(desc(count()))
      .limit(10),
    
    // Top regions
    db.select({ 
      region: analyticsEvents.region,
      country: analyticsEvents.country,
      visits: count()
    })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        sql`${analyticsEvents.region} IS NOT NULL`,
        whereClause
      ))
      .groupBy(analyticsEvents.region, analyticsEvents.country)
      .orderBy(desc(count()))
      .limit(10),
    
    // Top cities
    db.select({ 
      city: analyticsEvents.city,
      region: analyticsEvents.region,
      country: analyticsEvents.country,
      visits: count()
    })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        sql`${analyticsEvents.city} IS NOT NULL`,
        whereClause
      ))
      .groupBy(analyticsEvents.city, analyticsEvents.region, analyticsEvents.country)
      .orderBy(desc(count()))
      .limit(10)
  ]);

  const deviceTypes = categorizeDeviceTypes(userAgents.map(ua => ua.userAgent || ''));
  
  // Calculate average session duration
  const avgSessionDuration = sessionDurations.length > 0 
    ? sessionDurations.reduce((sum, session) => sum + Number(session.duration || 0), 0) / sessionDurations.length
    : 0;

  // Calculate total visits for percentage calculation
  const totalVisits = topCountries.reduce((sum, country) => sum + country.visits, 0);

  return {
    totalPageViews: totalPageViews[0]?.count || 0,
    uniqueVisitors: uniqueVisitors.length,
    averageSessionDuration: Math.round(avgSessionDuration),
    topPages: topPages.map(p => ({
      page: p.page || 'Unknown',
      views: p.views
    })),
    topReferrers: topReferrers.map(r => ({
      referrer: r.referrer || 'Direct',
      visits: r.visits
    })),
    deviceTypes,
    popularProjects: popularProjects.map(p => ({
      projectId: (p.data as any)?.projectId || 'unknown',
      projectTitle: (p.data as any)?.projectTitle || 'Unknown Project',
      views: p.views
    })),
    contactFormStats: {
      submissions: contactFormSubmissions[0]?.count || 0,
      successRate: (contactFormSubmissions[0]?.count || 0) > 0 
        ? ((successfulSubmissions[0]?.count || 0) / (contactFormSubmissions[0]?.count || 1)) * 100 
        : 0
    },
    hourlyActivity: hourlyActivity.map(h => ({
      hour: Number(h.hour),
      count: h.count
    })),
    dailyActivity: dailyActivity.map(d => ({
      date: d.date as string,
      pageViews: d.pageViews,
      uniqueVisitors: Number(d.uniqueVisitors)
    })),
    topCountries: topCountries.map(c => ({
      country: c.country || 'Unknown',
      visits: c.visits,
      percentage: totalVisits > 0 ? (c.visits / totalVisits) * 100 : 0
    })),
    topRegions: topRegions.map(r => ({
      region: r.region || 'Unknown',
      country: r.country || 'Unknown',
      visits: r.visits
    })),
    topCities: topCities.map(c => ({
      city: c.city || 'Unknown',
      region: c.region || 'Unknown',
      country: c.country || 'Unknown',
      visits: c.visits
    }))
  };
}

async function getRealTimeMetrics(): Promise<RealTimeMetrics> {
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
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        gte(analyticsEvents.timestamp, fiveMinutesAgo)
      ))
      .groupBy(analyticsEvents.page),
    
    // Recent events
    db.select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, fiveMinutesAgo))
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(20)
  ]);

  return {
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
}

async function getEvents(
  page: number = 1, 
  limit: number = 50, 
  filters?: AnalyticsFilters
) {
  const offset = (page - 1) * limit;
  const whereConditions = [];
  
  if (filters?.startDate) {
    whereConditions.push(gte(analyticsEvents.timestamp, filters.startDate));
  }
  
  if (filters?.endDate) {
    whereConditions.push(lte(analyticsEvents.timestamp, filters.endDate));
  }
  
  if (filters?.page) {
    whereConditions.push(eq(analyticsEvents.page, filters.page));
  }
  
  if (filters?.eventType) {
    whereConditions.push(eq(analyticsEvents.eventType, filters.eventType));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [events, totalCount] = await Promise.all([
    db.select()
      .from(analyticsEvents)
      .where(whereClause)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(limit)
      .offset(offset),
    
    db.select({ count: count() })
      .from(analyticsEvents)
      .where(whereClause)
  ]);

  return {
    events: events.map(event => ({
      id: event.id,
      eventType: event.eventType,
      page: event.page || undefined,
      referrer: event.referrer || undefined,
      userAgent: event.userAgent || undefined,
      ipAddress: event.ipAddress || undefined,
      sessionId: event.sessionId || undefined,
      data: event.data,
      timestamp: event.timestamp
    })),
    total: totalCount[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
  };
}

function categorizeDeviceTypes(userAgents: string[]) {
  const categories = {
    'Desktop': 0,
    'Mobile': 0,
    'Tablet': 0,
    'Unknown': 0
  };

  userAgents.forEach(ua => {
    if (!ua) {
      categories.Unknown++;
      return;
    }

    const lowerUA = ua.toLowerCase();
    
    if (lowerUA.includes('mobile') || lowerUA.includes('android') || lowerUA.includes('iphone')) {
      categories.Mobile++;
    } else if (lowerUA.includes('tablet') || lowerUA.includes('ipad')) {
      categories.Tablet++;
    } else if (lowerUA.includes('mozilla') || lowerUA.includes('chrome') || lowerUA.includes('safari')) {
      categories.Desktop++;
    } else {
      categories.Unknown++;
    }
  });

  return Object.entries(categories).map(([type, count]) => ({
    type,
    count
  }));
}

// Export for Vercel (production)
export default handle(app);

// Export app for development server
export { app };

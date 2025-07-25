import http from 'http';
import url from 'url';
import { db } from '../src/db/connection';
import { analyticsEvents } from '../src/db/schema';
import { eq, desc, count, and, gte, lte, sql } from 'drizzle-orm';
import type { 
  AnalyticsEvent, 
  AnalyticsMetrics, 
  AnalyticsFilters,
  RealTimeMetrics 
} from '../src/modules/analytics/types';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const recentEvents = new Map<string, number>(); // For event deduplication

function shouldAllowEvent(sessionId: string, eventType: string, page: string): boolean {
  const key = `${sessionId}_${eventType}_${page}`;
  const now = Date.now();
  const lastEventTime = recentEvents.get(key);
  
  // Allow session_start only once per session
  if (eventType === 'session_start') {
    if (lastEventTime) return false;
    recentEvents.set(key, now);
    return true;
  }
  
  // Throttle page_view events (max 1 per 5 seconds per page)
  if (eventType === 'page_view') {
    if (lastEventTime && (now - lastEventTime) < 5000) {
      return false;
    }
    recentEvents.set(key, now);
    return true;
  }
  
  // Other events are allowed
  return true;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  for (const [key, timestamp] of recentEvents.entries()) {
    if (timestamp < fiveMinutesAgo) {
      recentEvents.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getCacheKey(endpoint: string, params?: any): string {
  if (!params) return endpoint;
  return `${endpoint}_${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

function getPortFromArgs(): number {
  const args = process.argv;
  const portIndex = args.findIndex(arg => arg === '--port');
  
  if (portIndex !== -1 && portIndex + 1 < args.length) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  
  return 3001;
}

const PORT = getPortFromArgs();

import { getSiteConfig } from '../src/config/site-node';

const config = getSiteConfig();

function setCORSHeaders(res: http.ServerResponse) {
  const origin = process.env.NODE_ENV === 'production' 
    ? config.api.allowedOrigins[0] || 'http://localhost:8080'
    : '*';  // Allow all origins in development for easier testing
    
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sendJSON(res: http.ServerResponse, data: any, statusCode = 200) {
  setCORSHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function getMetrics(filters?: AnalyticsFilters): Promise<AnalyticsMetrics> {
  const cacheKey = getCacheKey('metrics', filters);
  const cached = getFromCache<AnalyticsMetrics>(cacheKey);
  
  if (cached) {
    return cached;
  }

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
    topPages,
    topReferrers,
    popularProjects,
    contactFormSubmissions,
    successfulSubmissions,
    hourlyActivity,
    dailyActivity,
    userAgents
  ] = await Promise.all([
    // Total page views
    db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, 'page_view'), whereClause)),
    
    // Unique visitors (by userId, fallback to sessionId)
    db.selectDistinct({ 
      userId: analyticsEvents.userId,
      sessionId: analyticsEvents.sessionId 
    })
      .from(analyticsEvents)
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
      .where(and(eq(analyticsEvents.eventType, 'session_start'), whereClause))
  ]);

  const deviceTypes = categorizeDeviceTypes(userAgents.map(ua => ua.userAgent || ''));

  // Calculate unique visitors (prefer userId, fallback to sessionId)
  const uniqueUserIds = new Set();
  uniqueVisitors.forEach(visitor => {
    if (visitor.userId) {
      uniqueUserIds.add(visitor.userId);
    } else {
      uniqueUserIds.add(visitor.sessionId);
    }
  });

  const result = {
    totalPageViews: totalPageViews[0]?.count || 0,
    uniqueVisitors: uniqueUserIds.size,
    averageSessionDuration: 0,
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
      successRate: contactFormSubmissions[0]?.count > 0 
        ? (successfulSubmissions[0]?.count || 0) / contactFormSubmissions[0].count * 100 
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
    }))
  };

  setCache(cacheKey, result, 2 * 60 * 1000);
  return result;
}

async function getRealTimeMetrics(): Promise<RealTimeMetrics> {
  const cacheKey = 'realtime_metrics';
  const cached = getFromCache<RealTimeMetrics>(cacheKey);
  
  if (cached) {
    return cached;
  }

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

  const result = {
    activeUsers: activeUsers.length,
    currentPageViews: currentPageViews.map(p => ({
      page: p.page || 'Unknown',
      activeUsers: Number(p.activeUsers)
    })),
    recentEvents: recentEvents.map(event => ({
      id: event.id,
      eventType: event.eventType,
      page: event.page,
      referrer: event.referrer,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
      sessionId: event.sessionId,
      data: event.data,
      timestamp: event.timestamp
    }))
  };

  setCache(cacheKey, result, 15 * 1000);
  return result;
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

const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url || '', true);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    // Health check
    if (pathname === '/api/health') {
      sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    // Analytics endpoints
    if (pathname === '/api/analytics/events' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const event: Omit<AnalyticsEvent, 'id' | 'timestamp'> = JSON.parse(body);
          
          // Check if we should allow this event (deduplication)
          if (!shouldAllowEvent(event.sessionId || 'unknown', event.eventType, event.page || '')) {
            sendJSON(res, { success: true, skipped: true });
            return;
          }
          
          await db.insert(analyticsEvents).values({
            eventType: event.eventType,
            page: event.page,
            referrer: event.referrer,
            userAgent: req.headers['user-agent'] || '',
            ipAddress: req.connection.remoteAddress || 'unknown',
            sessionId: event.sessionId,
            userId: event.userId,
            data: event.data,
          });

          sendJSON(res, { success: true });
        } catch (error) {
          console.error('Failed to track event:', error);
          sendJSON(res, { error: 'Failed to track event' }, 500);
        }
      });
      return;
    }

    if (pathname === '/api/analytics/metrics' && req.method === 'GET') {
      const filters: AnalyticsFilters = {
        startDate: query.startDate ? new Date(query.startDate as string) : undefined,
        endDate: query.endDate ? new Date(query.endDate as string) : undefined,
        page: query.page as string || undefined,
        eventType: query.eventType as string || undefined,
      };

      const metrics = await getMetrics(filters);
      sendJSON(res, metrics);
      return;
    }

    if (pathname === '/api/analytics/realtime' && req.method === 'GET') {
      const realTimeMetrics = await getRealTimeMetrics();
      sendJSON(res, realTimeMetrics);
      return;
    }

    // 404
    sendJSON(res, { error: 'Not found' }, 404);
    
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, { error: 'Internal server error' }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Analytics API server running on http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  POST /api/analytics/events');
  console.log('  GET  /api/analytics/metrics');
  console.log('  GET  /api/analytics/realtime');
  console.log('  GET  /api/health');
});

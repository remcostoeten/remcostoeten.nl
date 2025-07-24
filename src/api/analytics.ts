// API Routes for Analytics
// Add these to your Next.js API routes or Express server

import { db } from '../db/connection';
import { analyticsEvents } from '../db/schema';
import { eq, desc, count, and, gte, lte, sql } from 'drizzle-orm';
import type { 
  AnalyticsEvent, 
  AnalyticsMetrics, 
  AnalyticsFilters,
  RealTimeMetrics 
} from '../modules/analytics/types';

// POST /api/analytics/events
export async function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
  try {
    await db.insert(analyticsEvents).values({
      eventType: event.eventType,
      page: event.page,
      referrer: event.referrer,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
      sessionId: event.sessionId,
      data: event.data,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to track event:', error);
    throw error;
  }
}

// GET /api/analytics/metrics
export async function getMetrics(filters?: AnalyticsFilters): Promise<AnalyticsMetrics> {
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

  // Get metrics in parallel
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
    
    // Unique visitors
    db.selectDistinct({ sessionId: analyticsEvents.sessionId })
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

  return {
    totalPageViews: totalPageViews[0]?.count || 0,
    uniqueVisitors: uniqueVisitors.length,
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
      projectId: p.data?.projectId || 'unknown',
      projectTitle: p.data?.projectTitle || 'Unknown Project',
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
}

// GET /api/analytics/realtime
export async function getRealTimeMetrics(): Promise<RealTimeMetrics> {
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
      page: event.page,
      referrer: event.referrer,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
      sessionId: event.sessionId,
      data: event.data,
      timestamp: event.timestamp
    }))
  };
}

// GET /api/analytics/events
export async function getEvents(
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
      page: event.page,
      referrer: event.referrer,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
      sessionId: event.sessionId,
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

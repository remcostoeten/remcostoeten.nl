import { db } from '../../../db/connection';
import { analyticsEvents } from '../../../db/schema';
import { eq, desc, count, and, gte, lte, sql } from 'drizzle-orm';
import type { 
  AnalyticsEvent, 
  AnalyticsMetrics, 
  AnalyticsFilters,
  RealTimeMetrics 
} from '../types';

export class AnalyticsService {
  // Track a new analytics event
  static async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
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
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  // Get analytics metrics with filters
  static async getMetrics(filters?: AnalyticsFilters): Promise<AnalyticsMetrics> {
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

    // Get total page views
    const totalPageViewsResult = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        whereClause
      ));

    // Get unique visitors (based on session IDs)
    const uniqueVisitorsResult = await db
      .selectDistinct({ sessionId: analyticsEvents.sessionId })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        whereClause
      ));

    // Get top pages
    const topPages = await db
      .select({
        page: analyticsEvents.page,
        views: count()
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        whereClause
      ))
      .groupBy(analyticsEvents.page)
      .orderBy(desc(count()))
      .limit(10);

    // Get top referrers
    const topReferrers = await db
      .select({
        referrer: analyticsEvents.referrer,
        visits: count()
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        whereClause
      ))
      .groupBy(analyticsEvents.referrer)
      .orderBy(desc(count()))
      .limit(10);

    // Get popular projects
    const popularProjects = await db
      .select({
        data: analyticsEvents.data,
        views: count()
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'project_view'),
        whereClause
      ))
      .groupBy(analyticsEvents.data)
      .orderBy(desc(count()))
      .limit(10);

    // Get contact form stats
    const contactFormSubmissions = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'contact_form_submission'),
        whereClause
      ));

    const successfulSubmissions = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'contact_form_submission'),
        sql`${analyticsEvents.data}->>'success' = 'true'`,
        whereClause
      ));

    // Get hourly activity
    const hourlyActivity = await db
      .select({
        hour: sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`.as('hour'),
        count: count()
      })
      .from(analyticsEvents)
      .where(whereClause)
      .groupBy(sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`);

    // Get daily activity for the last 30 days
    const dailyActivity = await db
      .select({
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
      .orderBy(sql`DATE(${analyticsEvents.timestamp})`);

    // Calculate device types from user agents
    const userAgents = await db
      .select({ userAgent: analyticsEvents.userAgent })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'session_start'),
        whereClause
      ));

    const deviceTypes = this.categorizeDeviceTypes(userAgents.map(ua => ua.userAgent || ''));

    return {
      totalPageViews: totalPageViewsResult[0]?.count || 0,
      uniqueVisitors: uniqueVisitorsResult.length,
      averageSessionDuration: 0, // Would need session tracking to calculate this
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

  // Get real-time metrics
  static async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Get active users (unique sessions in last 5 minutes)
    const activeUsers = await db
      .selectDistinct({ sessionId: analyticsEvents.sessionId })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, fiveMinutesAgo));

    // Get current page views
    const currentPageViews = await db
      .select({
        page: analyticsEvents.page,
        activeUsers: sql`COUNT(DISTINCT ${analyticsEvents.sessionId})`.as('activeUsers')
      })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        gte(analyticsEvents.timestamp, fiveMinutesAgo)
      ))
      .groupBy(analyticsEvents.page);

    // Get recent events
    const recentEvents = await db
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, fiveMinutesAgo))
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(20);

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

  // Get events with pagination
  static async getEvents(
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

    const events = await db
      .select()
      .from(analyticsEvents)
      .where(whereClause)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(whereClause);

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

  // Helper method to categorize device types from user agents
  private static categorizeDeviceTypes(userAgents: string[]) {
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
}

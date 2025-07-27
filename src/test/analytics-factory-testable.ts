import { analyticsEvents } from '~/db/schema'
import { eq, desc, gte, and, count, countDistinct, min, max, lte } from 'drizzle-orm'
import type { TAnalyticsEvent, TNewAnalyticsEvent } from '~/db/schema'

type TAnalyticsMetrics = {
  readonly totalViews: number
  readonly uniqueVisitors: number
  readonly uniquePages: number
  readonly timeframe: 'day' | 'week' | 'month'
}

type TTopPage = {
  readonly path: string
  readonly views: number
}

type TPageViewData = {
  readonly page: string
  readonly userId?: string
  readonly sessionId?: string
  readonly userAgent?: string
  readonly referrer?: string
  readonly ipAddress?: string
  readonly country?: string
  readonly region?: string
  readonly city?: string
}

type TVisitorData = {
  readonly userId: string | null
  readonly pageViews: number
  readonly firstVisit: Date
  readonly lastVisit: Date
}

type TAnalyticsFactory = {
  readonly recordPageView: (data: TPageViewData) => Promise<TAnalyticsEvent | null>
  readonly getPageViews: (options?: { limit?: number; startDate?: Date; endDate?: Date }) => Promise<TAnalyticsEvent[]>
  readonly getVisitorData: (userId: string) => Promise<TVisitorData | null>
  readonly getAnalyticsMetrics: (timeframe: 'day' | 'week' | 'month') => Promise<TAnalyticsMetrics>
  readonly getTopPages: (limit?: number) => Promise<TTopPage[]>
  readonly getAnalyticsEvents: (options?: { eventType?: string; limit?: number }) => Promise<TAnalyticsEvent[]>
}

export function createAnalyticsFactory(db: any): TAnalyticsFactory {
  async function recordPageView(data: TPageViewData): Promise<TAnalyticsEvent | null> {
    try {
      const eventData: TNewAnalyticsEvent = {
        eventType: 'pageview',
        page: data.page,
        referrer: data.referrer,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        sessionId: data.sessionId,
        userId: data.userId,
        country: data.country,
        region: data.region,
        city: data.city,
        data: null
      }
      
      const result = await db.insert(analyticsEvents).values(eventData).returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to record page view:', error)
      return null
    }
  }

  async function getPageViews(options: { limit?: number; startDate?: Date; endDate?: Date } = {}): Promise<TAnalyticsEvent[]> {
    try {
      const { limit = 100, startDate, endDate } = options
      
      let whereConditions = [eq(analyticsEvents.eventType, 'pageview')]
      
      if (startDate) {
        whereConditions.push(gte(analyticsEvents.timestamp, startDate))
      }
      
      if (endDate) {
        whereConditions.push(lte(analyticsEvents.timestamp, endDate))
      }
      
      const result = await db
        .select()
        .from(analyticsEvents)
        .where(and(...whereConditions))
        .orderBy(desc(analyticsEvents.timestamp))
        .limit(limit)
      
      return result
    } catch (error) {
      console.error('Failed to get page views:', error)
      return []
    }
  }

  async function getVisitorData(userId: string): Promise<TVisitorData | null> {
    try {
      const result = await db
        .select({
          userId: analyticsEvents.userId,
          pageViews: count(analyticsEvents.id),
          firstVisit: min(analyticsEvents.timestamp),
          lastVisit: max(analyticsEvents.timestamp)
        })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.userId, userId),
            eq(analyticsEvents.eventType, 'pageview')
          )
        )
        .groupBy(analyticsEvents.userId)
      
      const visitorData = result[0]
      if (!visitorData) return null
      
      return {
        userId: visitorData.userId,
        pageViews: visitorData.pageViews,
        firstVisit: visitorData.firstVisit!,
        lastVisit: visitorData.lastVisit!
      }
    } catch (error) {
      console.error('Failed to get visitor data:', error)
      return null
    }
  }

  async function getAnalyticsMetrics(timeframe: 'day' | 'week' | 'month'): Promise<TAnalyticsMetrics> {
    try {
      const intervals = {
        day: 1,
        week: 7,
        month: 30
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - intervals[timeframe])

      const result = await db
        .select({
          totalViews: count(analyticsEvents.id),
          uniqueVisitors: countDistinct(analyticsEvents.userId),
          uniquePages: countDistinct(analyticsEvents.page)
        })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.eventType, 'pageview'),
            gte(analyticsEvents.timestamp, cutoffDate)
          )
        )
      
      const metrics = result[0]
      return {
        totalViews: metrics?.totalViews || 0,
        uniqueVisitors: metrics?.uniqueVisitors || 0,
        uniquePages: metrics?.uniquePages || 0,
        timeframe
      }
    } catch (error) {
      console.error('Failed to get analytics metrics:', error)
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        uniquePages: 0,
        timeframe
      }
    }
  }

  async function getTopPages(limit = 10): Promise<TTopPage[]> {
    try {
      const result = await db
        .select({
          path: analyticsEvents.page,
          views: count(analyticsEvents.id)
        })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventType, 'pageview'))
        .groupBy(analyticsEvents.page)
        .orderBy(desc(count(analyticsEvents.id)))
        .limit(limit)
      
      return result.map(row => ({
        path: row.path || '',
        views: row.views || 0
      }))
    } catch (error) {
      console.error('Failed to get top pages:', error)
      return []
    }
  }

  async function getAnalyticsEvents(options: { eventType?: string; limit?: number } = {}): Promise<TAnalyticsEvent[]> {
    try {
      const { eventType, limit = 100 } = options
      
      let baseQuery = db.select().from(analyticsEvents)
      
      if (eventType) {
        const result = await baseQuery
          .where(eq(analyticsEvents.eventType, eventType))
          .orderBy(desc(analyticsEvents.timestamp))
          .limit(limit)
        return result
      } else {
        const result = await baseQuery
          .orderBy(desc(analyticsEvents.timestamp))
          .limit(limit)
        return result
      }
    } catch (error) {
      console.error('Failed to get analytics events:', error)
      return []
    }
  }

  return {
    recordPageView,
    getPageViews,
    getVisitorData,
    getAnalyticsMetrics,
    getTopPages,
    getAnalyticsEvents
  }
}

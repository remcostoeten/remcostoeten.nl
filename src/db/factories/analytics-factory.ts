import { db } from '../connection'
import { analyticsEvents } from '../schema'
import { eq, sql, desc, gte, and } from 'drizzle-orm'

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

type TAnalyticsFactory = {
  readonly recordPageView: (data: { path: string; visitorId: string; userAgent?: string; referrer?: string }) => Promise<any | null>
  readonly getPageViews: (options?: { limit?: number; startDate?: Date; endDate?: Date }) => Promise<any[]>
  readonly getVisitorData: (visitorId: string) => Promise<any | null>
  readonly getAnalyticsMetrics: (timeframe: 'day' | 'week' | 'month') => Promise<TAnalyticsMetrics>
  readonly getTopPages: (limit?: number) => Promise<TTopPage[]>
}

const createAnalyticsFactory = (): TAnalyticsFactory => {
  const recordPageView = async (data: Omit<TPageView, 'id' | 'createdAt'>): Promise<TPageView | null> => {
    try {
      const result = await db.query(
        `INSERT INTO page_views (path, visitor_id, user_agent, referrer) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [data.path, data.visitorId, data.userAgent, data.referrer]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to record page view:', error)
      return null
    }
  }

  const getPageViews = async (options: { limit?: number; startDate?: Date; endDate?: Date } = {}): Promise<TPageView[]> => {
    try {
      const { limit = 100, startDate, endDate } = options
      let query = 'SELECT * FROM page_views'
      const params: unknown[] = []
      const conditions: string[] = []

      if (startDate) {
        conditions.push(`created_at >= $${params.length + 1}`)
        params.push(startDate)
      }

      if (endDate) {
        conditions.push(`created_at <= $${params.length + 1}`)
        params.push(endDate)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`
      params.push(limit)

      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      console.error('Failed to get page views:', error)
      return []
    }
  }

  const getVisitorData = async (visitorId: string): Promise<TVisitorData | null> => {
    try {
      const result = await db.query(
        'SELECT visitor_id, COUNT(*) as page_views, MIN(created_at) as first_visit, MAX(created_at) as last_visit FROM page_views WHERE visitor_id = $1 GROUP BY visitor_id',
        [visitorId]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to get visitor data:', error)
      return null
    }
  }

  const getAnalyticsMetrics = async (timeframe: 'day' | 'week' | 'month'): Promise<TAnalyticsMetrics> => {
    try {
      const intervals = {
        day: '1 day',
        week: '7 days',
        month: '30 days'
      }

      const result = await db.query(
        `SELECT 
           COUNT(*) as total_views,
           COUNT(DISTINCT visitor_id) as unique_visitors,
           COUNT(DISTINCT path) as unique_pages
         FROM page_views 
         WHERE created_at >= NOW() - INTERVAL '${intervals[timeframe]}'`
      )

      return {
        totalViews: parseInt(result.rows[0]?.total_views || '0'),
        uniqueVisitors: parseInt(result.rows[0]?.unique_visitors || '0'),
        uniquePages: parseInt(result.rows[0]?.unique_pages || '0'),
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

  const getTopPages = async (limit = 10): Promise<Array<{ path: string; views: number }>> => {
    try {
      const result = await db.query(
        'SELECT path, COUNT(*) as views FROM page_views GROUP BY path ORDER BY views DESC LIMIT $1',
        [limit]
      )
      return result.rows.map(row => ({
        path: row.path,
        views: parseInt(row.views)
      }))
    } catch (error) {
      console.error('Failed to get top pages:', error)
      return []
    }
  }

  return {
    recordPageView,
    getPageViews,
    getVisitorData,
    getAnalyticsMetrics,
    getTopPages
  }
}

export const analyticsFactory = createAnalyticsFactory()

import { describe, it, expect, beforeEach } from 'vitest'
import { analyticsFactory } from '~/db/factories/analytics-factory'
import { db } from '~/db/connection'

// Mock the db connection
vi.mock('~/db/connection', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{
          id: 'test-id',
          eventType: 'pageview',
          page: '/test',
          timestamp: new Date(),
          userId: 'test-user'
        }])
      }))
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => [])
          })),
          limit: vi.fn(() => []),
          groupBy: vi.fn(() => [])
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => [])
        })),
        limit: vi.fn(() => []),
        groupBy: vi.fn(() => [])
      }))
    }))
  }
}))

const mockDb = vi.mocked(db)

describe('Analytics Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('recordPageView', () => {
    it('should record a page view', async () => {
      const pageViewData = {
        page: '/home',
        userId: 'user123'
      }

      const result = await analyticsFactory.recordPageView(pageViewData)
      
      expect(result).toBeTruthy()
      expect(mockDb.insert).toHaveBeenCalled()
    })
  })

  describe('getPageViews', () => {
    it('should get page views with default options', async () => {
      const result = await analyticsFactory.getPageViews()
      
      expect(mockDb.select).toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should get page views with limit', async () => {
      const result = await analyticsFactory.getPageViews({ limit: 5 })
      
      expect(mockDb.select).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('getAnalyticsMetrics', () => {
    it('should get metrics for day timeframe', async () => {
      const result = await analyticsFactory.getAnalyticsMetrics('day')
      
      expect(result.timeframe).toBe('day')
      expect(typeof result.totalViews).toBe('number')
      expect(typeof result.uniqueVisitors).toBe('number')
      expect(typeof result.uniquePages).toBe('number')
    })

    it('should get metrics for week timeframe', async () => {
      const result = await analyticsFactory.getAnalyticsMetrics('week')
      
      expect(result.timeframe).toBe('week')
    })

    it('should get metrics for month timeframe', async () => {
      const result = await analyticsFactory.getAnalyticsMetrics('month')
      
      expect(result.timeframe).toBe('month')
    })
  })

  describe('getTopPages', () => {
    it('should get top pages with default limit', async () => {
      const result = await analyticsFactory.getTopPages()
      
      expect(mockDb.select).toHaveBeenCalled()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should get top pages with custom limit', async () => {
      const result = await analyticsFactory.getTopPages(5)
      
      expect(mockDb.select).toHaveBeenCalled()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getAnalyticsEvents', () => {
    it('should get all events', async () => {
      const result = await analyticsFactory.getAnalyticsEvents()
      
      expect(mockDb.select).toHaveBeenCalled()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter by event type', async () => {
      const result = await analyticsFactory.getAnalyticsEvents({ eventType: 'pageview' })
      
      expect(mockDb.select).toHaveBeenCalled()
      expect(Array.isArray(result)).toBe(true)
    })
  })
})

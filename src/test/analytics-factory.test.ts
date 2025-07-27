import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDb, insertTestAnalyticsEvents } from './db-utils'
import { createAnalyticsFactory } from './analytics-factory-testable'
import type { TNewAnalyticsEvent } from '~/db/schema'

describe('Analytics Factory', () => {
  let testDb: any
  let cleanup: () => void
  let analyticsFactory: ReturnType<typeof createAnalyticsFactory>

  beforeEach(() => {
    const dbSetup = createTestDb()
    testDb = dbSetup.db
    cleanup = dbSetup.cleanup
    analyticsFactory = createAnalyticsFactory(testDb)
  })

  afterEach(() => {
    cleanup()
  })

  describe('recordPageView', () => {
    it('should record a page view successfully', async () => {
      const pageViewData = {
        page: '/home',
        userId: 'user123',
        sessionId: 'session456',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referrer: 'https://google.com',
        ipAddress: '192.168.1.1',
        country: 'US',
        region: 'CA',
        city: 'San Francisco'
      }

      const result = await analyticsFactory.recordPageView(pageViewData)

      expect(result).toBeTruthy()
      expect(result?.eventType).toBe('pageview')
      expect(result?.page).toBe('/home')
      expect(result?.userId).toBe('user123')
      expect(result?.sessionId).toBe('session456')
      expect(result?.country).toBe('US')
    })

    it('should record minimal page view data', async () => {
      const pageViewData = {
        page: '/about'
      }

      const result = await analyticsFactory.recordPageView(pageViewData)

      expect(result).toBeTruthy()
      expect(result?.eventType).toBe('pageview')
      expect(result?.page).toBe('/about')
      expect(result?.userId).toBeNull()
    })
  })

  describe('getPageViews', () => {
    beforeEach(async () => {
      // Insert test data
      const testEvents: TNewAnalyticsEvent[] = [
        {
          eventType: 'pageview',
          page: '/home',
          userId: 'user1',
          sessionId: 'session1',
          data: null
        },
        {
          eventType: 'pageview', 
          page: '/about',
          userId: 'user2',
          sessionId: 'session2',
          data: null
        },
        {
          eventType: 'click',
          page: '/home',
          userId: 'user1',
          data: null
        }
      ]
      
      await insertTestAnalyticsEvents(testDb, testEvents)
    })

    it('should return only pageview events', async () => {
      const result = await analyticsFactory.getPageViews()

      expect(result).toHaveLength(2)
      expect(result.every(event => event.eventType === 'pageview')).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const result = await analyticsFactory.getPageViews({ limit: 1 })

      expect(result).toHaveLength(1)
    })

    it('should filter by date range', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const result = await analyticsFactory.getPageViews({
        startDate: yesterday,
        endDate: tomorrow
      })

      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getVisitorData', () => {
    beforeEach(async () => {
      // Insert test data for a specific user
      const testEvents: TNewAnalyticsEvent[] = [
        {
          eventType: 'pageview',
          page: '/home',
          userId: 'user1',
          sessionId: 'session1',
          data: null
        },
        {
          eventType: 'pageview',
          page: '/about',
          userId: 'user1', 
          sessionId: 'session1',
          data: null
        },
        {
          eventType: 'pageview',
          page: '/contact',
          userId: 'user2',
          sessionId: 'session2',
          data: null
        }
      ]
      
      await insertTestAnalyticsEvents(testDb, testEvents)
    })

    it('should return visitor data for existing user', async () => {
      const result = await analyticsFactory.getVisitorData('user1')

      expect(result).toBeTruthy()
      expect(result?.userId).toBe('user1')
      expect(result?.pageViews).toBe(2)
      expect(result?.firstVisit).toBeInstanceOf(Date)
      expect(result?.lastVisit).toBeInstanceOf(Date)
    })

    it('should return null for non-existing user', async () => {
      const result = await analyticsFactory.getVisitorData('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getAnalyticsMetrics', () => {
    beforeEach(async () => {
      // Insert test data
      const testEvents: TNewAnalyticsEvent[] = [
        {
          eventType: 'pageview',
          page: '/home',
          userId: 'user1',
          sessionId: 'session1',
          data: null
        },
        {
          eventType: 'pageview',
          page: '/about',
          userId: 'user2',
          sessionId: 'session2', 
          data: null
        },
        {
          eventType: 'pageview',
          page: '/home',
          userId: 'user1',
          sessionId: 'session1',
          data: null
        }
      ]
      
      await insertTestAnalyticsEvents(testDb, testEvents)
    })

    it('should return correct metrics for day timeframe', async () => {
      const result = await analyticsFactory.getAnalyticsMetrics('day')

      expect(result.timeframe).toBe('day')
      expect(result.totalViews).toBe(3)
      expect(result.uniqueVisitors).toBe(2)  // user1 and user2
      expect(result.uniquePages).toBe(2)     // /home and /about
    })

    it('should return correct metrics for week timeframe', async () => {
      const result = await analyticsFactory.getAnalyticsMetrics('week')

      expect(result.timeframe).toBe('week')
      expect(result.totalViews).toBe(3)
    })

    it('should return correct metrics for month timeframe', async () => {
      const result = await analyticsFactory.getAnalyticsMetrics('month')

      expect(result.timeframe).toBe('month')
      expect(result.totalViews).toBe(3)
    })
  })

  describe('getTopPages', () => {
    beforeEach(async () => {
      // Insert test data with different page view counts
      const testEvents: TNewAnalyticsEvent[] = [
        // /home gets 3 views
        { eventType: 'pageview', page: '/home', userId: 'user1', data: null },
        { eventType: 'pageview', page: '/home', userId: 'user2', data: null },
        { eventType: 'pageview', page: '/home', userId: 'user3', data: null },
        // /about gets 2 views
        { eventType: 'pageview', page: '/about', userId: 'user1', data: null },
        { eventType: 'pageview', page: '/about', userId: 'user2', data: null },
        // /contact gets 1 view
        { eventType: 'pageview', page: '/contact', userId: 'user1', data: null }
      ]
      
      await insertTestAnalyticsEvents(testDb, testEvents)
    })

    it('should return top pages ordered by views', async () => {
      const result = await analyticsFactory.getTopPages()

      expect(result).toHaveLength(3)
      expect(result[0].path).toBe('/home')
      expect(result[0].views).toBe(3)
      expect(result[1].path).toBe('/about')
      expect(result[1].views).toBe(2) 
      expect(result[2].path).toBe('/contact')
      expect(result[2].views).toBe(1)
    })

    it('should respect limit parameter', async () => {
      const result = await analyticsFactory.getTopPages(2)

      expect(result).toHaveLength(2)
      expect(result[0].path).toBe('/home')
      expect(result[1].path).toBe('/about')
    })
  })

  describe('getAnalyticsEvents', () => {
    beforeEach(async () => {
      // Insert mixed event types
      const testEvents: TNewAnalyticsEvent[] = [
        { eventType: 'pageview', page: '/home', userId: 'user1', data: null },
        { eventType: 'click', page: '/home', userId: 'user1', data: null },
        { eventType: 'pageview', page: '/about', userId: 'user2', data: null },
        { eventType: 'scroll', page: '/about', userId: 'user2', data: null }
      ]
      
      await insertTestAnalyticsEvents(testDb, testEvents)
    })

    it('should return all events when no eventType specified', async () => {
      const result = await analyticsFactory.getAnalyticsEvents()

      expect(result).toHaveLength(4)
    })

    it('should filter by eventType', async () => {  
      const result = await analyticsFactory.getAnalyticsEvents({ eventType: 'pageview' })

      expect(result).toHaveLength(2)
      expect(result.every(event => event.eventType === 'pageview')).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const result = await analyticsFactory.getAnalyticsEvents({ limit: 2 })

      expect(result).toHaveLength(2)
    })

    it('should filter by eventType and limit', async () => {
      const result = await analyticsFactory.getAnalyticsEvents({ 
        eventType: 'pageview', 
        limit: 1
      })

      expect(result).toHaveLength(1)
      expect(result[0].eventType).toBe('pageview')
    })
  })
})

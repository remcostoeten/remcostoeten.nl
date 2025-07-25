import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db, analyticsEvents, type TNewAnalyticsEvent } from './db'
import { desc, count, sql, countDistinct, and, gte, lte, eq } from 'drizzle-orm'

const app = new Hono()

const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 15000
const eventBatch: TNewAnalyticsEvent[] = []
let isProcessing = false

function getCachedData(key: string, calculator: () => Promise<any>) {
  const cached = cache.get(key)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return Promise.resolve(cached.data)
  }
  
  return calculator().then(data => {
    cache.set(key, { data, timestamp: now })
    return data
  })
}

async function processBatch() {
  if (isProcessing || eventBatch.length === 0) return
  
  isProcessing = true
  const batch = eventBatch.splice(0, eventBatch.length)
  
  try {
    if (batch.length > 0) {
      await db.insert(analyticsEvents).values(batch)
    }
  } catch (error) {
    console.error('Error inserting batch events:', error)
  }
  
  cache.clear()
  
  isProcessing = false
}

setInterval(processBatch, 2000)

function categorizeDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'Mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'Tablet'
  } else {
    return 'Desktop'
  }
}

function processAnalyticsEvent(eventData: any) {
  const event: TNewAnalyticsEvent = {
    eventType: eventData.eventType,
    page: eventData.page || null,
    referrer: eventData.referrer || null,
    userAgent: eventData.userAgent || null,
    ipAddress: eventData.ipAddress || null,
    sessionId: eventData.sessionId || null,
    userId: eventData.userId || null,
    data: eventData.data || null,
    timestamp: new Date()
  }
  
  eventBatch.push(event)
  
  cache.clear()
}

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3333', 'http://localhost:3000', 'http://localhost:5173'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'simple-api'
  })
})

// Analytics endpoints
app.get('/api/analytics/events', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = (page - 1) * limit
  
  try {
    const [events, totalResult] = await Promise.all([
      db.select().from(analyticsEvents)
        .orderBy(desc(analyticsEvents.timestamp))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(analyticsEvents)
    ])
    
    const total = totalResult[0]?.count || 0
    
    return c.json({ 
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return c.json({ error: 'Failed to fetch events' }, 500)
  }
})

app.post('/api/analytics/events', async (c) => {
  try {
    const event = await c.req.json()
    processAnalyticsEvent(event)
    return c.json({ 
      success: true, 
      message: 'Event tracked successfully',
      eventId: `event_${Date.now()}`
    })
  } catch (error) {
    console.error('Error processing analytics event:', error)
    return c.json({ 
      success: false, 
      message: 'Failed to track event' 
    }, 400)
  }
})

app.get('/api/analytics/metrics', async (c) => {
  return getCachedData('metrics', async () => {
    try {
      // Calculate total page views
      const totalPageViewsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventType, 'page_view'))
      
      const totalPageViews = totalPageViewsResult[0]?.count || 0
      
      // Get unique visitors
      const uniqueVisitorsResult = await db
        .select({ count: countDistinct(analyticsEvents.userId) })
        .from(analyticsEvents)
        .where(analyticsEvents.userId !== null)
      
      const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0
      
      // Get top pages
      const topPagesResult = await db
        .select({
          page: analyticsEvents.page,
          views: count()
        })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.eventType, 'page_view'),
          analyticsEvents.page !== null
        ))
        .groupBy(analyticsEvents.page)
        .orderBy(desc(count()))
        .limit(10)
      
      // Get top referrers
      const topReferrersResult = await db
        .select({
          referrer: analyticsEvents.referrer,
          visits: count()
        })
        .from(analyticsEvents)
        .where(analyticsEvents.referrer !== null)
        .groupBy(analyticsEvents.referrer)
        .orderBy(desc(count()))
        .limit(10)
      
      // Get device types by analyzing user agents
      const userAgentsResult = await db
        .select({
          userAgent: analyticsEvents.userAgent,
          count: count()
        })
        .from(analyticsEvents)
        .where(analyticsEvents.userAgent !== null)
        .groupBy(analyticsEvents.userAgent)
      
      const deviceTypes = userAgentsResult.reduce((acc, { userAgent, count }) => {
        const deviceType = categorizeDevice(userAgent || '')
        acc[deviceType] = (acc[deviceType] || 0) + Number(count)
        return acc
      }, {} as Record<string, number>)
      
      const deviceTypesArray = Object.entries(deviceTypes)
        .map(([type, count]) => ({ type, count }))
      
      // Get hourly activity
      const hourlyActivityResult = await db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`,
          count: count()
        })
        .from(analyticsEvents)
        .groupBy(sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${analyticsEvents.timestamp})`)
      
      // Get daily activity (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const dailyActivityResult = await db
        .select({
          date: sql<string>`DATE(${analyticsEvents.timestamp})`,
          pageViews: count(),
          uniqueVisitors: countDistinct(analyticsEvents.userId)
        })
        .from(analyticsEvents)
        .where(and(
          gte(analyticsEvents.timestamp, thirtyDaysAgo),
          eq(analyticsEvents.eventType, 'page_view')
        ))
        .groupBy(sql`DATE(${analyticsEvents.timestamp})`)
        .orderBy(sql`DATE(${analyticsEvents.timestamp})`)
      
      const metrics = {
        totalPageViews,
        uniqueVisitors,
        averageSessionDuration: 0,
        topPages: topPagesResult,
        topReferrers: topReferrersResult,
        deviceTypes: deviceTypesArray,
        popularProjects: [],
        contactFormStats: {
          submissions: 0,
          successRate: 0
        },
        hourlyActivity: hourlyActivityResult,
        dailyActivity: dailyActivityResult
      }
      
      return metrics
    } catch (error) {
      console.error('Error fetching metrics:', error)
      throw error
    }
  }).then(metrics => c.json(metrics))
    .catch(error => c.json({ error: 'Failed to fetch metrics' }, 500))
})

app.get('/api/analytics/realtime', async (c) => {
  return getCachedData('realtime', async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      // Get recent events
      const recentEvents = await db
        .select()
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, fiveMinutesAgo))
        .orderBy(desc(analyticsEvents.timestamp))
        .limit(20)
      
      // Get active users count
      const activeUsersResult = await db
        .select({ count: countDistinct(analyticsEvents.userId) })
        .from(analyticsEvents)
        .where(and(
          gte(analyticsEvents.timestamp, fiveMinutesAgo),
          analyticsEvents.userId !== null
        ))
      
      const activeUsers = activeUsersResult[0]?.count || 0
      
      // Get active sessions count
      const activeSessionsResult = await db
        .select({ count: countDistinct(analyticsEvents.sessionId) })
        .from(analyticsEvents)
        .where(and(
          gte(analyticsEvents.timestamp, fiveMinutesAgo),
          analyticsEvents.sessionId !== null
        ))
      
      const activeSessions = activeSessionsResult[0]?.count || 0
      
      // Get current page views by page
      const currentPageViewsResult = await db
        .select({
          page: analyticsEvents.page,
          activeUsers: countDistinct(analyticsEvents.userId)
        })
        .from(analyticsEvents)
        .where(and(
          gte(analyticsEvents.timestamp, fiveMinutesAgo),
          eq(analyticsEvents.eventType, 'page_view'),
          analyticsEvents.page !== null
        ))
        .groupBy(analyticsEvents.page)
      
      const realtimeMetrics = {
        activeUsers,
        activeSessions,
        currentPageViews: currentPageViewsResult,
        recentEvents: recentEvents.map(event => ({
          id: event.id,
          eventType: event.eventType,
          page: event.page,
          referrer: event.referrer,
          userAgent: event.userAgent,
          ipAddress: event.ipAddress,
          sessionId: event.sessionId,
          userId: event.userId,
          data: event.data,
          timestamp: event.timestamp
        }))
      }
      
      return realtimeMetrics
    } catch (error) {
      console.error('Error fetching realtime metrics:', error)
      throw error
    }
  }).then(metrics => c.json(metrics))
    .catch(error => c.json({ error: 'Failed to fetch realtime metrics' }, 500))
})

// Catch all for undefined routes
app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err)
  return c.json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong'
  }, 500)
})

const port = 3334

console.log(`🚀 Simple API server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Simple API server running on http://localhost:${info.port}`)
  console.log('📊 Analytics endpoints available:')
  console.log('  - GET  /api/analytics/events')
  console.log('  - POST /api/analytics/events')
  console.log('  - GET  /api/analytics/metrics')
  console.log('  - GET  /health')
})

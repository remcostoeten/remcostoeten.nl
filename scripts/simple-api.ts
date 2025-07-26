import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db, analyticsEvents, adminUser, adminSessions, adminActivityLog, type TNewAnalyticsEvent, type TAdminUser, type TNewAdminSession, type TNewAdminActivityLog } from './db'
import { desc, count, sql, countDistinct, and, gte, lte, eq, gt } from 'drizzle-orm'
import { createHash, randomBytes } from 'crypto'

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

// Auth helper functions
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "remcostoeten@hotmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Mhca6r4g1!"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'salt_remco_2024').digest('hex')
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

function calculateExpiresAt(): Date {
  return new Date(Date.now() + SESSION_DURATION)
}

async function ensureAdminExists(): Promise<TAdminUser> {
  const existingAdmin = await db.select().from(adminUser).where(eq(adminUser.email, ADMIN_EMAIL)).limit(1)
  
  if (existingAdmin.length > 0) {
    return existingAdmin[0]
  }

  const newAdmin = await db.insert(adminUser).values({
    email: ADMIN_EMAIL,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    isActive: true,
  }).returning()

  return newAdmin[0]
}

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3333', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:3335'],
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

// Auth endpoints
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password, ipAddress, userAgent } = await c.req.json()
    
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return c.text('Invalid credentials', 401)
    }

    const admin = await ensureAdminExists()
    
    // Update last login
    await db.update(adminUser)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUser.id, admin.id))

    // Create session
    const token = generateToken()
    const expiresAt = calculateExpiresAt()

    const sessionData: TNewAdminSession = {
      userId: admin.id,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    }

    await db.insert(adminSessions).values(sessionData)

    // Log activity
    await db.insert(adminActivityLog).values({
      userId: admin.id,
      action: 'login',
      module: 'auth',
      details: { ipAddress },
      ipAddress,
    })

    return c.json({
      token,
      expiresAt,
      user: {
        id: admin.id,
        email: admin.email,
        lastLoginAt: admin.lastLoginAt,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.text('Login failed', 500)
  }
})

app.post('/api/auth/validate', async (c) => {
  try {
    const { token } = await c.req.json()
    
    if (!token || token.length !== 64) {
      return c.text('Invalid token', 401)
    }

    const session = await db
      .select({
        session: adminSessions,
        user: adminUser,
      })
      .from(adminSessions)
      .innerJoin(adminUser, eq(adminSessions.userId, adminUser.id))
      .where(
        and(
          eq(adminSessions.token, token),
          gt(adminSessions.expiresAt, new Date()),
          eq(adminUser.isActive, true)
        )
      )
      .limit(1)

    if (session.length === 0) {
      return c.text('Invalid or expired session', 401)
    }

    return c.json({
      user: {
        id: session[0].user.id,
        email: session[0].user.email,
        lastLoginAt: session[0].user.lastLoginAt,
      },
      session: session[0].session,
    })
  } catch (error) {
    console.error('Validation error:', error)
    return c.text('Validation failed', 500)
  }
})

app.post('/api/auth/logout', async (c) => {
  try {
    const { token, ipAddress } = await c.req.json()
    
    if (!token) {
      return c.text('Token required', 400)
    }

    // Get session info before deleting
    const session = await db
      .select({
        session: adminSessions,
        user: adminUser,
      })
      .from(adminSessions)
      .innerJoin(adminUser, eq(adminSessions.userId, adminUser.id))
      .where(eq(adminSessions.token, token))
      .limit(1)
    
    if (session.length > 0) {
      // Delete session
      await db.delete(adminSessions).where(eq(adminSessions.token, token))
      
      // Log activity
      await db.insert(adminActivityLog).values({
        userId: session[0].user.id,
        action: 'logout',
        module: 'auth',
        details: { ipAddress },
        ipAddress,
      })
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return c.text('Logout failed', 500)
  }
})

app.get('/api/auth/activity', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    
    const activity = await db
      .select({
        action: adminActivityLog.action,
        module: adminActivityLog.module,
        details: adminActivityLog.details,
        timestamp: adminActivityLog.timestamp,
        ipAddress: adminActivityLog.ipAddress,
      })
      .from(adminActivityLog)
      .orderBy(desc(adminActivityLog.timestamp))
      .limit(limit)

    return c.json(activity)
  } catch (error) {
    console.error('Activity fetch error:', error)
    return c.json({ error: 'Failed to fetch activity' }, 500)
  }
})

// Analytics endpoints
app.get('/api/analytics/events', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = (page - 1) * limit
  
  // Extract filter parameters
  const startDate = c.req.query('startDate')
  const endDate = c.req.query('endDate')
  const pageFilter = c.req.query('filterPage') // Note: using filterPage to avoid conflict with 'page' pagination param
  const eventTypeFilter = c.req.query('eventType')
  
  try {
    // Build filter conditions
    const filterConditions = []
    
    if (startDate) {
      filterConditions.push(gte(analyticsEvents.timestamp, new Date(startDate)))
    }
    if (endDate) {
      filterConditions.push(lte(analyticsEvents.timestamp, new Date(endDate)))
    }
    if (pageFilter && pageFilter !== 'all') {
      filterConditions.push(eq(analyticsEvents.page, pageFilter))
    }
    if (eventTypeFilter && eventTypeFilter !== 'all') {
      filterConditions.push(eq(analyticsEvents.eventType, eventTypeFilter))
    }
    
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined
    
    const [events, totalResult] = await Promise.all([
      db.select().from(analyticsEvents)
        .where(whereClause)
        .orderBy(desc(analyticsEvents.timestamp))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(analyticsEvents)
        .where(whereClause)
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
  // Extract query parameters for filtering
  const startDate = c.req.query('startDate')
  const endDate = c.req.query('endDate')
  const pageFilter = c.req.query('page')
  const eventTypeFilter = c.req.query('eventType')
  
  // Create cache key that includes filters
  const cacheKey = `metrics-${startDate || 'null'}-${endDate || 'null'}-${pageFilter || 'null'}-${eventTypeFilter || 'null'}`
  
  return getCachedData(cacheKey, async () => {
    try {
      // Build base filter conditions
      const baseConditions = []
      
      // Add date range filters
      if (startDate) {
        baseConditions.push(gte(analyticsEvents.timestamp, new Date(startDate)))
      }
      if (endDate) {
        baseConditions.push(lte(analyticsEvents.timestamp, new Date(endDate)))
      }
      
      // Add page filter
      if (pageFilter && pageFilter !== 'all') {
        baseConditions.push(eq(analyticsEvents.page, pageFilter))
      }
      
      // For page views specifically
      const pageViewConditions = [
        eq(analyticsEvents.eventType, 'page_view'),
        ...baseConditions
      ]
      
      // For event type filter (applies to all queries)
      const eventTypeConditions = [...baseConditions]
      if (eventTypeFilter && eventTypeFilter !== 'all') {
        eventTypeConditions.push(eq(analyticsEvents.eventType, eventTypeFilter))
      }
      
      // Calculate total page views with filters
      const totalPageViewsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(pageViewConditions.length > 0 ? and(...pageViewConditions) : undefined)
      
      const totalPageViews = totalPageViewsResult[0]?.count || 0
      
      // Get unique visitors with filters
      const uniqueVisitorsResult = await db
        .select({ count: countDistinct(analyticsEvents.userId) })
        .from(analyticsEvents)
        .where(and(
          analyticsEvents.userId !== null,
          ...(eventTypeConditions.length > 0 ? eventTypeConditions : [])
        ))
      
      const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0
      
      // Get top pages with filters
      const topPagesResult = await db
        .select({
          page: analyticsEvents.page,
          views: count()
        })
        .from(analyticsEvents)
        .where(and(
          eq(analyticsEvents.eventType, 'page_view'),
          analyticsEvents.page !== null,
          ...(baseConditions.length > 0 ? baseConditions : [])
        ))
        .groupBy(analyticsEvents.page)
        .orderBy(desc(count()))
        .limit(10)
      
      // Get top referrers with filters
      const topReferrersResult = await db
        .select({
          referrer: analyticsEvents.referrer,
          visits: count()
        })
        .from(analyticsEvents)
        .where(and(
          analyticsEvents.referrer !== null,
          ...(eventTypeConditions.length > 0 ? eventTypeConditions : [])
        ))
        .groupBy(analyticsEvents.referrer)
        .orderBy(desc(count()))
        .limit(10)
      
      // Get device types by analyzing user agents with filters
      const userAgentsResult = await db
        .select({
          userAgent: analyticsEvents.userAgent,
          count: count()
        })
        .from(analyticsEvents)
        .where(and(
          analyticsEvents.userAgent !== null,
          ...(eventTypeConditions.length > 0 ? eventTypeConditions : [])
        ))
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

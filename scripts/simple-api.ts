import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

const analyticsData = {
  events: [] as any[],
  sessions: new Set<string>(),
  users: new Set<string>(),
  pageViews: new Map<string, number>(),
  referrers: new Map<string, number>(),
  deviceTypes: new Map<string, number>(),
  hourlyActivity: new Map<number, number>(),
  dailyActivity: new Map<string, { pageViews: number, uniqueVisitors: Set<string> }>()
}

const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 15000
const eventBatch: any[] = []
let isProcessing = false

function getCachedData(key: string, calculator: () => any) {
  const cached = cache.get(key)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }
  
  const data = calculator()
  cache.set(key, { data, timestamp: now })
  return data
}

function processBatch() {
  if (isProcessing || eventBatch.length === 0) return
  
  isProcessing = true
  const batch = eventBatch.splice(0, eventBatch.length)
  
  batch.forEach(processAnalyticsEventSync)
  
  cache.delete('metrics')
  cache.delete('realtime')
  
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

// Sync version of event processing for batch operations
function processAnalyticsEventSync(event: any) {
  // Store the event
  analyticsData.events.unshift({
    ...event,
    id: Date.now(),
    timestamp: new Date().toISOString()
  })
  
  // Keep only last 1000 events
  if (analyticsData.events.length > 1000) {
    analyticsData.events = analyticsData.events.slice(0, 1000)
  }
  
  // Track sessions
  if (event.sessionId) {
    analyticsData.sessions.add(event.sessionId)
  }
  
  // Track unique users
  if (event.userId) {
    analyticsData.users.add(event.userId)
  }
  
  // Track page views
  if (event.eventType === 'page_view' && event.page) {
    const currentCount = analyticsData.pageViews.get(event.page) || 0
    analyticsData.pageViews.set(event.page, currentCount + 1)
  }
  
  // Track referrers
  if (event.referrer) {
    const referrer = event.referrer || 'Direct'
    const currentCount = analyticsData.referrers.get(referrer) || 0
    analyticsData.referrers.set(referrer, currentCount + 1)
  }
  
  // Track device types
  if (event.userAgent) {
    const deviceType = categorizeDevice(event.userAgent)
    const currentCount = analyticsData.deviceTypes.get(deviceType) || 0
    analyticsData.deviceTypes.set(deviceType, currentCount + 1)
  }
  
  // Track hourly activity
  const hour = new Date().getHours()
  const currentHourCount = analyticsData.hourlyActivity.get(hour) || 0
  analyticsData.hourlyActivity.set(hour, currentHourCount + 1)
  
  // Track daily activity
  const today = new Date().toISOString().split('T')[0]
  const dailyData = analyticsData.dailyActivity.get(today) || { 
    pageViews: 0, 
    uniqueVisitors: new Set<string>() 
  }
  
  if (event.eventType === 'page_view') {
    dailyData.pageViews++
    if (event.userId) {
      dailyData.uniqueVisitors.add(event.userId)
    }
  }
  
  analyticsData.dailyActivity.set(today, dailyData)
}

// Add event to queue for batch processing (performance optimization)
function processAnalyticsEvent(event: any) {
  eventBatch.push(event)
  
  cache.delete('metrics')
  cache.delete('realtime')
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
app.get('/api/analytics/events', (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = (page - 1) * limit
  
  const events = analyticsData.events.slice(offset, offset + limit)
  const total = analyticsData.events.length
  
  return c.json({ 
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  })
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

app.get('/api/analytics/metrics', (c) => {
  // Calculate total page views
  const totalPageViews = Array.from(analyticsData.pageViews.values())
    .reduce((sum, views) => sum + views, 0)
  
  // Get top pages
  const topPages = Array.from(analyticsData.pageViews.entries())
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
  
  // Get top referrers
  const topReferrers = Array.from(analyticsData.referrers.entries())
    .map(([referrer, visits]) => ({ referrer, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
  
  // Get device types
  const deviceTypes = Array.from(analyticsData.deviceTypes.entries())
    .map(([type, count]) => ({ type, count }))
  
  // Get hourly activity
  const hourlyActivity = Array.from(analyticsData.hourlyActivity.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour)
  
  // Get daily activity
  const dailyActivity = Array.from(analyticsData.dailyActivity.entries())
    .map(([date, data]) => ({
      date,
      pageViews: data.pageViews,
      uniqueVisitors: data.uniqueVisitors.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  const metrics = {
    totalPageViews,
    uniqueVisitors: analyticsData.users.size, // Use users instead of sessions for unique visitors
    averageSessionDuration: 0,
    topPages,
    topReferrers,
    deviceTypes,
    popularProjects: [],
    contactFormStats: {
      submissions: 0,
      successRate: 0
    },
    hourlyActivity,
    dailyActivity
  }
  
  return c.json(metrics)
})

app.get('/api/analytics/realtime', (c) => {
  // Get events from last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const recentEvents = analyticsData.events
    .filter(event => new Date(event.timestamp) > fiveMinutesAgo)
    .slice(0, 20)
  
  // Get active sessions and users from recent events
  const activeSessions = new Set()
  const activeUsers = new Set()
  recentEvents.forEach(event => {
    if (event.sessionId) {
      activeSessions.add(event.sessionId)
    }
    if (event.userId) {
      activeUsers.add(event.userId)
    }
  })
  
  // Get current page views by page from recent events (using userId for better tracking)
  const currentPageViews = new Map()
  recentEvents
    .filter(event => event.eventType === 'page_view')
    .forEach(event => {
      if (event.page) {
        const userSet = currentPageViews.get(event.page) || new Set()
        if (event.userId) {
          userSet.add(event.userId)
        }
        currentPageViews.set(event.page, userSet)
      }
    })
  
  const currentPageViewsArray = Array.from(currentPageViews.entries())
    .map(([page, users]) => ({
      page,
      activeUsers: users.size
    }))
  
  const realtimeMetrics = {
    activeUsers: activeUsers.size, // Use unique users instead of sessions
    activeSessions: activeSessions.size, // Also provide session count
    currentPageViews: currentPageViewsArray,
    recentEvents: recentEvents.map(event => ({
      id: event.id,
      eventType: event.eventType,
      page: event.page,
      referrer: event.referrer,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
      sessionId: event.sessionId,
      userId: event.userId, // Include userId in the response
      data: event.data,
      timestamp: event.timestamp
    }))
  }
  
  return c.json(realtimeMetrics)
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

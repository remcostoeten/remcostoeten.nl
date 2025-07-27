#!/usr/bin/env node

/**
 * Manual verification script for analytics flow
 * This script will:
 * 1. Start the development server
 * 2. Make API calls to simulate page views
 * 3. Query the database to verify events are stored
 * 4. Display results
 */

import { spawn } from 'child_process'
import { promises as fs } from 'fs'

const API_BASE_URL = 'http://localhost:3000'

// Helper function to wait for server to be ready
async function waitForServer(url, timeout = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) return true
    } catch (err) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`Server did not start within ${timeout}ms`)
}

// Function to make API requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
    return await response.json()
  } catch (error) {
    console.error(`Request failed: ${error.message}`)
    return null
  }
}

// Test analytics endpoints
async function testAnalyticsFlow() {
  console.log('🧪 Testing Analytics Flow')
  console.log('=' .repeat(40))
  
  // Test 1: Record some page views
  console.log('📊 Recording test page views...')
  
  const testEvents = [
    {
      page: '/home',
      userId: 'test-user-1',
      sessionId: 'session-1',
      userAgent: 'Test Browser 1.0',
      referrer: 'https://google.com',
      country: 'US'
    },
    {
      page: '/about', 
      userId: 'test-user-2',
      sessionId: 'session-2',
      userAgent: 'Test Browser 1.0',
      referrer: 'https://twitter.com',
      country: 'CA'
    },
    {
      page: '/home',
      userId: 'test-user-1', 
      sessionId: 'session-1',
      userAgent: 'Test Browser 1.0',
      country: 'US'
    }
  ]

  for (const event of testEvents) {
    const result = await makeRequest(`${API_BASE_URL}/api/analytics/pageview`, {
      method: 'POST',
      body: JSON.stringify(event)
    })
    
    if (result && result.success) {
      console.log(`✅ Recorded pageview: ${event.page}`)
    } else {
      console.log(`❌ Failed to record pageview: ${event.page}`)
    }
  }

  // Test 2: Get analytics events
  console.log('\n📋 Fetching analytics events...')
  const eventsResult = await makeRequest(`${API_BASE_URL}/api/analytics/events?limit=10`)
  
  if (eventsResult && eventsResult.success) {
    console.log(`✅ Retrieved ${eventsResult.data.length} events`)
    eventsResult.data.forEach(event => {
      console.log(`   - ${event.eventType}: ${event.page} (User: ${event.userId || 'Anonymous'})`)
    })
  } else {
    console.log('❌ Failed to retrieve events')
  }

  // Test 3: Get analytics metrics
  console.log('\n📈 Fetching analytics metrics...')
  const metricsResult = await makeRequest(`${API_BASE_URL}/api/analytics/metrics?timeframe=day`)
  
  if (metricsResult && metricsResult.success) {
    const { totalViews, uniqueVisitors, uniquePages } = metricsResult.data
    console.log(`✅ Analytics Metrics (24h):`)
    console.log(`   - Total Views: ${totalViews}`)
    console.log(`   - Unique Visitors: ${uniqueVisitors}`)
    console.log(`   - Unique Pages: ${uniquePages}`)
  } else {
    console.log('❌ Failed to retrieve metrics')
  }

  // Test 4: Get top pages
  console.log('\n🏆 Fetching top pages...')
  const topPagesResult = await makeRequest(`${API_BASE_URL}/api/analytics/top-pages?limit=5`)
  
  if (topPagesResult && topPagesResult.success) {
    console.log(`✅ Top Pages:`)
    topPagesResult.data.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}: ${page.views} views`)
    })
  } else {
    console.log('❌ Failed to retrieve top pages')
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Analytics Flow Verification')
  console.log('=======================================\n')
  
  console.log('📝 Instructions for manual verification:')
  console.log('1. Open your browser to http://localhost:3000')
  console.log('2. Navigate between different pages')
  console.log('3. Check the database for analytics events')
  console.log('4. Compare with API responses below\n')

  // Start the dev server
  console.log('🔧 Starting development server...')
  const server = spawn('pnpm', ['dev'], {
    stdio: 'pipe',
    detached: false
  })

  let serverOutput = ''
  server.stdout.on('data', (data) => {
    serverOutput += data.toString()
    if (data.toString().includes('Local:')) {
      console.log('✅ Development server started')
    }
  })

  server.stderr.on('data', (data) => {
    console.log('Server:', data.toString())
  })

  try {
    // Wait for server to be ready
    await waitForServer(`${API_BASE_URL}/api/analytics/events`)
    console.log('✅ Server is ready\n')
    
    // Run analytics tests
    await testAnalyticsFlow()
    
    console.log('\n✅ Analytics flow verification completed!')
    console.log('\n📊 Manual verification steps:')
    console.log('1. Visit http://localhost:3000 in your browser')
    console.log('2. Navigate to different pages (home, about, etc.)')
    console.log('3. Check database with: pnpm db:studio')
    console.log('4. Verify events are being inserted into analytics_events table')
    console.log('\nPress Ctrl+C to stop the server')
    
    // Keep the server running
    await new Promise(() => {})
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    server.kill()
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...')
  process.exit(0)
})

main().catch(console.error)

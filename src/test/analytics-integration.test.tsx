import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, waitFor } from '@solidjs/testing-library'
import { Router, Route } from "@solidjs/router"
import { AnalyticsTracker } from '~/components/analytics/AnalyticsTracker'

// Mock the fetch function to intercept API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock navigator
Object.defineProperty(global.navigator, 'userAgent', {
  value: 'Test User Agent',
  writable: true
})

// Mock document referrer
Object.defineProperty(global.document, 'referrer', {
  value: 'https://test-referrer.com',
  writable: true
})

function TestPage() {
  return (
    <div>
      <AnalyticsTracker userId="test-user" sessionId="test-session" />
      <div>Test Content</div>
    </div>
  )
}

function TestApp() {
  return (
    <Router>
      <Route path="/" component={TestPage} />
    </Router>
  )
}

describe('Analytics Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  })

  it('should track page view when component mounts', async () => {
    render(() => <TestApp />)

    // Wait for the analytics tracker to make the API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    }, { timeout: 1000 })

    // Verify the API call was made with correct data
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"eventType":"pageview"')
    })

    // Parse the body to verify contents
    const callArgs = mockFetch.mock.calls[0]
    const requestBody = JSON.parse(callArgs[1].body)
    
    expect(requestBody).toMatchObject({
      eventType: 'pageview',
      page: '/',
      userId: 'test-user',
      sessionId: 'test-session',
      userAgent: 'Test User Agent',
      referrer: 'https://test-referrer.com'
    })
  })

  it('should handle API errors gracefully', async () => {
    // Mock fetch to reject
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(() => <TestApp />)

    // Wait for the analytics tracker to attempt the API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    }, { timeout: 1000 })

    // Verify error was logged
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })

    consoleError.mockRestore()
  })

  it('should not duplicate tracking for same path', async () => {
    render(() => <TestApp />)

    // Wait for initial tracking
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    }, { timeout: 1000 })

    const initialCallCount = mockFetch.mock.calls.length

    // Wait a bit more to see if duplicate calls are made
    await new Promise(resolve => setTimeout(resolve, 500))

    // Should not have made additional calls for the same path
    expect(mockFetch).toHaveBeenCalledTimes(initialCallCount)
  })
})

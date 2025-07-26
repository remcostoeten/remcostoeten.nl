import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { analyticsFactory } from '~/db/factories/analytics-factory'

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url)
    const timeframe = url.searchParams.get('timeframe') as 'day' | 'week' | 'month' || 'week'

    if (!['day', 'week', 'month'].includes(timeframe)) {
      return json({ 
        success: false, 
        error: 'Invalid timeframe. Must be: day, week, or month' 
      }, { status: 400 })
    }

    const metrics = await analyticsFactory.getAnalyticsMetrics(timeframe)
    return json({ success: true, data: metrics })
  } catch (error) {
    console.error('GET /api/analytics/metrics error:', error)
    return json({ success: false, error: 'Failed to fetch analytics metrics' }, { status: 500 })
  }
}

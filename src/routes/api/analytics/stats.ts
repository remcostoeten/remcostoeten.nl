import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { analyticsFactory, type TAnalyticsStats } from '~/db/factories/analytics-factory'
import { StatsQuerySchema } from '~/lib/validation/analytics'

export async function GET(event: APIEvent): Promise<Response> {
  try {
    const url = new URL(event.request.url)
    const queryParams = {
      timeframe: url.searchParams.get('timeframe') || 'week'
    }

    // Validate query parameters with Zod
    const validationResult = StatsQuerySchema.safeParse(queryParams)
    
    if (!validationResult.success) {
      return json({ 
        success: false, 
        error: 'Invalid query parameters',
        details: validationResult.error.issues
      }, { status: 400 })
    }

    const { timeframe } = validationResult.data

    const stats = await analyticsFactory.getAnalyticsMetrics(timeframe)
    
    const typedStats: TAnalyticsStats = stats
    
    return json({ 
      success: true, 
      data: typedStats 
    })
  } catch (error) {
    console.error('GET /api/analytics/stats error:', error)
    return json({ 
      success: false, 
      error: 'Failed to fetch analytics stats' 
    }, { status: 500 })
  }
}

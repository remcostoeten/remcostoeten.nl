import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { analyticsFactory } from '~/db/factories/analytics-factory'
import { EventsQuerySchema } from '~/lib/validation/analytics'
import type { TAnalyticsEvent } from '~/db/schema'

export async function GET(event: APIEvent): Promise<Response> {
  try {
    const url = new URL(event.request.url)
    const queryParams = {
      eventType: url.searchParams.get('eventType') || undefined,
      limit: url.searchParams.get('limit') || '100'
    }

    // Validate query parameters with Zod
    const validationResult = EventsQuerySchema.safeParse(queryParams)
    
    if (!validationResult.success) {
      return json({ 
        success: false, 
        error: 'Invalid query parameters',
        details: validationResult.error.issues
      }, { status: 400 })
    }

    const { eventType, limit } = validationResult.data
    
    const events = await analyticsFactory.getAnalyticsEvents({ 
      eventType, 
      limit 
    })
    
    const typedEvents: TAnalyticsEvent[] = events
    
    return json({ 
      success: true, 
      data: typedEvents 
    })
  } catch (error) {
    console.error('GET /api/analytics/events error:', error)
    return json({ 
      success: false, 
      error: 'Failed to fetch analytics events' 
    }, { status: 500 })
  }
}

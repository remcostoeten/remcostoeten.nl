import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { analyticsFactory } from '~/db/factories/analytics-factory'
import { AnalyticsEventSchema, PageViewSchema } from '~/lib/validation/analytics'
import type { TAnalyticsEvent } from '~/db/schema'

export async function POST(event: APIEvent): Promise<Response> {
  try {
    const body = await event.request.json()
    
    // Validate the payload with Zod
    const validationResult = AnalyticsEventSchema.safeParse(body)
    
    if (!validationResult.success) {
      return json({ 
        success: false, 
        error: 'Invalid payload',
        details: validationResult.error.issues
      }, { status: 400 })
    }

    const eventData = validationResult.data

    // If it's a pageview event, we can use the specific recordPageView method
    if (eventData.eventType === 'pageview') {
      const pageViewValidation = PageViewSchema.safeParse(eventData)
      
      if (!pageViewValidation.success) {
        return json({ 
          success: false, 
          error: 'Invalid page view data',
          details: pageViewValidation.error.issues
        }, { status: 400 })
      }

      const result = await analyticsFactory.recordPageView(pageViewValidation.data)
      
      if (!result) {
        return json({ 
          success: false, 
          error: 'Failed to record page view' 
        }, { status: 500 })
      }

      const typedResult: TAnalyticsEvent = result
      return json({ 
        success: true, 
        data: typedResult 
      }, { status: 201 })
    }

    // For other event types, we could extend the factory or handle them differently
    // For now, we'll return an error for unsupported event types
    return json({ 
      success: false, 
      error: 'Event type not supported yet' 
    }, { status: 400 })

  } catch (error) {
    console.error('POST /api/analytics error:', error)
    return json({ 
      success: false, 
      error: 'Failed to record analytics event' 
    }, { status: 500 })
  }
}

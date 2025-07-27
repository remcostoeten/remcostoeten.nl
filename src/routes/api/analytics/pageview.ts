import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { analyticsFactory } from '~/db/factories/analytics-factory'
import { PageViewSchema } from '~/lib/validation/analytics'
import type { TAnalyticsEvent } from '~/db/schema'

export async function POST(event: APIEvent): Promise<Response> {
  try {
    const body = await event.request.json()
    
    // Validate the payload with Zod
    const validationResult = PageViewSchema.safeParse(body)
    
    if (!validationResult.success) {
      return json({ 
        success: false, 
        error: 'Invalid payload',
        details: validationResult.error.issues
      }, { status: 400 })
    }

    const pageViewData = validationResult.data

    const pageView = await analyticsFactory.recordPageView(pageViewData)

    if (!pageView) {
      return json({ 
        success: false, 
        error: 'Failed to record page view' 
      }, { status: 500 })
    }

    const typedResult: TAnalyticsEvent = pageView
    return json({ 
      success: true, 
      data: typedResult 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/analytics/pageview error:', error)
    return json({ 
      success: false, 
      error: 'Failed to record page view' 
    }, { status: 500 })
  }
}

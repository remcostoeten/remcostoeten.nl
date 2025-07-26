import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { analyticsFactory } from '~/db/factories/analytics-factory'

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json()
    const { path, visitorId, userAgent, referrer } = body

    if (!path || !visitorId) {
      return json({ 
        success: false, 
        error: 'Missing required fields: path, visitorId' 
      }, { status: 400 })
    }

    const pageView = await analyticsFactory.recordPageView({
      path,
      visitorId,
      userAgent,
      referrer
    })

    if (!pageView) {
      return json({ success: false, error: 'Failed to record page view' }, { status: 500 })
    }

    return json({ success: true, data: pageView }, { status: 201 })
  } catch (error) {
    console.error('POST /api/analytics/pageview error:', error)
    return json({ success: false, error: 'Failed to record page view' }, { status: 500 })
  }
}

import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { analyticsFactory } from '~/db/factories/analytics-factory'

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url)
    const limit = url.searchParams.get('limit')
    
    const topPages = await analyticsFactory.getTopPages(limit ? parseInt(limit) : undefined)
    return json({ success: true, data: topPages })
  } catch (error) {
    console.error('GET /api/analytics/top-pages error:', error)
    return json({ success: false, error: 'Failed to fetch top pages' }, { status: 500 })
  }
}

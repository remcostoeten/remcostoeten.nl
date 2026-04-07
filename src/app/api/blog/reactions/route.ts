import {
	getEmptyReactions,
	getReactions
} from '@/server/queries/blog/reactions'
import { getVisitorId } from '@/server/request'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const slug = searchParams.get('slug')

	if (!slug) {
		return Response.json({ error: 'Missing slug' }, { status: 400 })
	}

	try {
		const visitorId = await getVisitorId()
		const result = await getReactions(slug, visitorId)
		return Response.json(result)
	} catch (error) {
		console.error('[GET /api/blog/reactions] Error:', error)
		return Response.json(
			{ reactions: getEmptyReactions() },
			{ status: 500 }
		)
	}
}

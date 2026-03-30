import { getComments } from '@/server/queries/blog/comments'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const slug = searchParams.get('slug')

	if (!slug) {
		return Response.json({ error: 'Missing slug' }, { status: 400 })
	}

	try {
		const result = await getComments(slug)
		return Response.json(result)
	} catch (error) {
		console.error('[GET /api/blog/comments] Error:', error)
		return Response.json({ comments: [] }, { status: 500 })
	}
}

import renderToolOpenGraphImage from '@/features/miscellaneous/og/tool-open-graph-image'

type Context = {
	params: Promise<{ slug: string }>
}

export async function GET(request: Request, { params }: Context) {
	const response = await renderToolOpenGraphImage({
		params,
		backgroundUrl: new URL('/images/tools-og-backdrop.png', request.url)
			.href
	})
	response.headers.set(
		'Cache-Control',
		'public, max-age=86400, s-maxage=31536000, immutable'
	)
	return response
}

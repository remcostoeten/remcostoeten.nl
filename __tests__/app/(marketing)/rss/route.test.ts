import { beforeEach, describe, expect, it, vi } from 'vitest'

const blogMocks = vi.hoisted(() => ({
	getVisibleBlogPosts: vi.fn()
}))

vi.mock('@/features/blog', () => blogMocks)
vi.mock('@/app/sitemap', () => ({
	baseUrl: 'https://remcostoeten.nl'
}))

describe('rss route', () => {
	beforeEach(() => {
		vi.resetModules()
		blogMocks.getVisibleBlogPosts.mockReset()
	})

	it('escapes xml content and returns the rss content type', async () => {
		blogMocks.getVisibleBlogPosts.mockResolvedValue([
			{
				slug: 'engineering/escape-test',
				metadata: {
					title: 'Hello & Goodbye',
					summary: '2 < 3 and "quotes" too',
					publishedAt: '2026-04-07',
					draft: false
				}
			}
		])

		const { GET } = await import('@/app/(marketing)/rss/route')
		const response = await GET()
		const body = await response.text()

		expect(blogMocks.getVisibleBlogPosts).toHaveBeenCalledTimes(1)
		expect(response.headers.get('content-type')).toBe(
			'application/rss+xml; charset=utf-8'
		)
		expect(body).toContain('<title>Hello &amp; Goodbye</title>')
		expect(body).toContain(
			'<description>2 &lt; 3 and &quot;quotes&quot; too</description>'
		)
		expect(body).toContain(
			'<link>https://remcostoeten.nl/blog/engineering/escape-test</link>'
		)
		expect(body).not.toContain('<title>Hello & Goodbye</title>')
	})
})

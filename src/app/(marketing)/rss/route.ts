import { baseUrl } from '@/core/config/site'
import { getVisibleBlogPosts } from '@/features/blog'

function escapeXml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

export async function GET() {
	const allBlogs = await getVisibleBlogPosts()

	const itemsXml = allBlogs
		.map(
			post =>
				`<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${escapeXml(`${baseUrl}/blog/${post.slug}`)}</link>
          <description>${escapeXml(post.metadata.summary || '')}</description>
          <pubDate>${new Date(
				post.metadata.publishedAt
			).toUTCString()}</pubDate>
        </item>`
		)
		.join('\n')

	const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>My Portfolio</title>
        <link>${baseUrl}</link>
        <description>This is my portfolio RSS feed</description>
        ${itemsXml}
    </channel>
  </rss>`

	return new Response(rssFeed, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8'
		}
	})
}

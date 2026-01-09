import { getAllBlogPosts } from '@/modules/blog/queries'
import { baseUrl, siteConfig } from '@/core/config'

export async function GET() {
    const allBlogs = getAllBlogPosts()

    const sortedBlogs = allBlogs.sort((a, b) => {
        if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1
        }
        return 1
    })

    const mostRecentPost = sortedBlogs[0]
    const lastModified = mostRecentPost
        ? new Date(mostRecentPost.metadata.publishedAt).toUTCString()
        : new Date().toUTCString()

    const itemsXml = sortedBlogs
        .map(post => {
            const postUrl = `${baseUrl}/blog/${post.slug}`
            return `<item>
          <title>${post.metadata.title}</title>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <description><![CDATA[${post.metadata.summary || ''}]]></description>
          <author>${siteConfig.author.email} (${siteConfig.author.name})</author>
          <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
        </item>`
        })
        .join('\n')

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${siteConfig.name}</title>
        <link>${baseUrl}</link>
        <description>${siteConfig.description}</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
        <webMaster>${siteConfig.author.email} (${siteConfig.author.name})</webMaster>
        <managingEditor>${siteConfig.author.email} (${siteConfig.author.name})</managingEditor>
        ${itemsXml}
    </channel>
  </rss>`

    return new Response(rssFeed, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Last-Modified': lastModified,
            'Cache-Control': 'public, max-age=3600, must-revalidate'
        }
    })
}

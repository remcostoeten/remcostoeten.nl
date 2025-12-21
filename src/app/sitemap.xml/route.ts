import { getBlogPosts, getAllTags } from '@/utils/utils'
import { baseUrl } from '../sitemap'

export async function GET() {
  const posts = getBlogPosts()
  const tags = getAllTags()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${baseUrl}/sitemap-pages.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>
      <sitemap>
        <loc>${baseUrl}/sitemap-posts.xml</loc>
        <lastmod>${new Date(posts[0]?.metadata.publishedAt || new Date()).toISOString()}</lastmod>
      </sitemap>
      <sitemap>
        <loc>${baseUrl}/sitemap-tags.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>
    </sitemapindex>
  `

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      'Encoding': 'UTF-8',
    },
  })
}

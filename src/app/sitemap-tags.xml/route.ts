import { getAllTags } from '@/utils/utils'
import { baseUrl } from '../sitemap'

export async function GET() {
  const tags = getAllTags()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${tags.map(tag => `
      <url>
        <loc>${baseUrl}/blog/tags/${tag.name.toLowerCase()}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`).join('')}
    </urlset>
  `

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      'Encoding': 'UTF-8',
    },
  })
}
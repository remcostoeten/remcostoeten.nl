import { getBlogPosts } from '@/utils/utils'
import { baseUrl } from '../sitemap'

export async function GET() {
  const posts = getBlogPosts()
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${posts.map((post) => {
        const url = `${baseUrl}/blog/${post.slug}`
        const lastMod = new Date(post.metadata.publishedAt).toISOString()
        const priority = 0.8 // Slightly lower than main pages but higher than categories
        
        return `
          <url>
            <loc>${url}</loc>
            <lastmod>${lastMod}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>${priority}</priority>
          </url>
        `
      }).join('')}
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

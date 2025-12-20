import { getAllCategories } from '@/utils/utils'
import { baseUrl } from '../sitemap'

export async function GET() {
  const categories = getAllCategories()
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${categories.map((category) => {
        const url = `${baseUrl}/blog/categories/${category.name.toLowerCase()}`
        const lastMod = new Date().toISOString()
        const priority = 0.7 // Categories have lower priority than posts
        
        return `
          <url>
            <loc>${url}</loc>
            <lastmod>${lastMod}</lastmod>
            <changefreq>weekly</changefreq>
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

import type { MetadataRoute } from 'next'
import { baseUrl } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/'
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl
    }
}

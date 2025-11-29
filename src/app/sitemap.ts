import type { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/modules/blog/queries'
import { baseUrl } from '@/core/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let blogs = getAllBlogPosts().map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.metadata.publishedAt
    }))

    let routes = ['', '/blog'].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0]
    }))

    return [...routes, ...blogs]
}

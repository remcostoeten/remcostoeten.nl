import { getBlogPosts, getAllTags } from '@/utils/utils'
import { MetadataRoute } from 'next'

export const baseUrl = 'https://remcostoeten.nl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getBlogPosts()
  const tags = getAllTags()

  const routes = [
    {
      url: '',
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: '/blog',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: '/blog/categories',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/blog/topics',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/about',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: '/contact',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ] as const

  const blogs = posts.map((post) => {
    const date = new Date(post.metadata.publishedAt)
    const isValidDate = !isNaN(date.getTime())

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: isValidDate ? date : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }
  })

  const tagRoutes = tags.map((tag) => ({
    url: `${baseUrl}/blog/tags/${tag.name.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...routes.map((route) => ({
      url: `${baseUrl}${route.url}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...blogs,
    ...tagRoutes,
  ]
}

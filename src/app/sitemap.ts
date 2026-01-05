import { getBlogPosts, getAllTags } from '@/utils/utils'

export const baseUrl = 'https://remcostoeten.nl'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let tags = getAllTags().map((tag) => ({
    url: `${baseUrl}/blog/tags/${tag.name.toLowerCase()}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  let routes = ['', '/blog', '/blog/tags', '/blog/topics'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs, ...tags]
}

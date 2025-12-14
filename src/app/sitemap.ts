import { getBlogPosts, getAllCategories } from '@/utils/utils'

export const baseUrl = 'https://remcostoeten.nl'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let categories = getAllCategories().map((category) => ({
    url: `${baseUrl}/blog/categories/${category.name.toLowerCase()}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  let routes = ['', '/blog', '/blog/categories', '/blog/topics'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs, ...categories]
}

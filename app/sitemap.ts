import { getBlogPosts, getAllCategories } from 'app/blog/utils'

export const baseUrl = 'https://portfolio-blog-starter.vercel.app'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let categories = getAllCategories().map((category) => ({
    url: `${baseUrl}/categories/${category.name.toLowerCase()}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  let routes = ['', '/blog', '/categories'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs, ...categories]
}

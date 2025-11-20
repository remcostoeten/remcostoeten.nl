import { getAllBlogPosts } from '../repositories/mdx-repository'
import type { BlogPost } from '../types'

export function getBlogPost(slug: string): BlogPost | undefined {
    return getAllBlogPosts().find(post => post.slug === slug)
}

/**
 * @name getBlogPost
 * @description Retrieves a single blog post by its slug. Returns undefined if no post matches the provided slug.
 */
import { getAllBlogPosts } from './get-all-blog-posts'
import type { BlogPost } from '../types'

export function getBlogPost(slug: string): BlogPost | undefined {
    return getAllBlogPosts().find(post => post.slug === slug)
}

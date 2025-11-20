import { getAllBlogPosts } from '../repositories/mdx-repository'
import type { BlogPost } from '../types'

export function getBlogPosts(): BlogPost[] {
    return getAllBlogPosts()
}

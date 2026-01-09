/**
 * @name getAllBlogPosts
 * @description Retrieves all blog posts from the MDX files directory. Parses all .mdx files and returns them as an array of BlogPost objects.
 */
import path from 'path'
import { getMDXData } from '../utils/mdx-helpers'

const BLOG_POSTS_DIR = path.join(process.cwd(), 'src', 'app', 'blog', 'posts')

export function getAllBlogPosts() {
    return getMDXData(BLOG_POSTS_DIR)
}


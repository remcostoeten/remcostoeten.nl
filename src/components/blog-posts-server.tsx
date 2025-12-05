import { getBlogPosts } from 'src/utils/utils'
import { BlogPostsClient } from './blog-posts-client'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  // Sort posts by date (newest first)
  const sortedBlogs = allBlogs.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })

  return (
    <BlogPostsClient posts={sortedBlogs} />
  )
}

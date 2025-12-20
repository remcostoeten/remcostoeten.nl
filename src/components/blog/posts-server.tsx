import { getBlogPosts, getAllBlogPosts } from '@/utils/utils'
import { isAdmin } from '@/utils/is-admin'
import { BlogPostsClient, PostCountHeader } from './posts-client'
import { Section } from '../ui/section'

export async function BlogPosts() {
  const userIsAdmin = await isAdmin()

  // Admin sees all posts including drafts, regular users only see published
  const allBlogs = userIsAdmin ? getAllBlogPosts() : getBlogPosts()

  const sortedBlogs = allBlogs.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })

  return (
    <Section
      title="Recent Posts"
      headerAction={<PostCountHeader count={sortedBlogs.length} />}
    >
      <BlogPostsClient posts={sortedBlogs} />
    </Section>
  )
}


import { getBlogPosts } from '@/utils/utils'
import { BlogPostsClient, PostCountHeader } from './posts-client'
import { Section } from '../ui/section'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

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


import { getBlogPosts } from '@/utils/utils'
import { BlogPostsClient } from './blog-posts-client'
import { Section } from './ui/section'
import { FileText } from 'lucide-react'

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
      headerAction={<span className="text-muted-foreground/60">{sortedBlogs.length} posts</span>}
      noPadding
    >
      <BlogPostsClient posts={sortedBlogs} />
    </Section>
  )
}

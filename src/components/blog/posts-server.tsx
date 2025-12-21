'use server'

import { getBlogPosts, getAllBlogPosts } from '@/utils/utils'
import { isAdmin } from '@/utils/is-admin'
import { BlogPostsClient, PostCountHeader } from './posts-client'
import { Section } from '../ui/section'
import { db } from '@/server/db/connection'
import { blogPosts } from '@/server/db/schema'

export async function BlogPosts() {
  const userIsAdmin = await isAdmin()

  const allBlogs = userIsAdmin ? getAllBlogPosts() : getBlogPosts()

  const viewData = await db.select({
    slug: blogPosts.slug,
    views: blogPosts.totalViews,
    uniqueViews: blogPosts.uniqueViews
  }).from(blogPosts)

  const viewsMap = new Map(viewData.map(v => [v.slug, { total: v.views, unique: v.uniqueViews }]))

  const sortedBlogs = allBlogs.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  }).map(post => ({
    ...post,
    views: viewsMap.get(post.slug)?.total || 0,
    uniqueViews: viewsMap.get(post.slug)?.unique || 0
  }))

  return (
    <Section
      title="Recent Posts"
      headerAction={<PostCountHeader count={sortedBlogs.length} />}
    >
      <BlogPostsClient posts={sortedBlogs} />
    </Section>
  )
}


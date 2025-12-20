import { notFound } from 'next/navigation'

import { getBlogPosts, getAllBlogPosts, calculateReadTime } from '@/utils/utils'
import { baseUrl } from '@/app/sitemap'
import { CustomMDX } from '@/components/blog/mdx'
import { BlogPostClient, PostNavigation } from '@/components/blog/post-view'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { ReactionBar } from '@/components/blog/reaction-bar'
import { CommentSection } from '@/components/blog/comment-section'
import { checkAdminStatus } from '@/actions/auth'
import { PostAdminControls } from '@/components/blog/post-admin-controls'
import { BlogPostStructuredData } from '@/components/seo/structured-data'

// Force dynamic rendering due to auth requirements
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts
    .filter(post => post && post.slug)
    .map((post) => ({
      slug: post.slug.split('/'),
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const resolvedParams = await params
  let slug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join('/')
    : resolvedParams.slug

  if (!slug) {
    return {}
  }

  let post = getBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    return {}
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

// No dynamic imports in this file - moved to client component

export default async function Blog({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const resolvedParams = await params
  let slug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join('/')
    : resolvedParams.slug

  if (!slug) {
    notFound()
  }

  // Get all posts including drafts for now
  // We'll filter client-side based on admin status
  const allPosts = getAllBlogPosts()
  const post = allPosts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  // Check if user is admin on the server side for initial render
  const isAdminUser = await checkAdminStatus()
  
  // If it's a draft and user is not admin, show 404
  if (post.metadata.draft && !isAdminUser) {
    notFound()
  }

  const currentIndex = allPosts.findIndex(p => p.slug === slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  return (
    <>
      <BlogPostStructuredData
        title={post.metadata.title}
        description={post.metadata.summary}
        publishedAt={post.metadata.publishedAt}
        author="Remco Stoeten"
        image={post.metadata.image}
        url={`${baseUrl}/blog/${post.slug}`}
        keywords={post.metadata.tags || []}
      />
      <TableOfContents />
      
      {/* Client-side admin controls and draft banner */}
      <PostAdminControls post={post} />

      <section className="bg-pattern relative">
        <BlogPostClient
          publishedAt={post.metadata.publishedAt}
          categories={post.metadata.categories}
          tags={post.metadata.tags}
          topics={post.metadata.topics}
          title={post.metadata.title}
          readTime={calculateReadTime(post.content)}
        />

        <div className="space-y-6 mb">
          <h1 className="title font-medium text-3xl tracking-tight max-w-3xl mb-2 leading-tight">
            {post.metadata.title}
          </h1>
          <div className="flex justify-between items-start text-sm max-w-3xl">
            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {post.metadata.summary}
            </p>
          </div>
        </div>

        <div className="screen-border mb-12" />

        <article className="prose prose-quoteless prose-neutral dark:prose-invert max-w-3xl">
          <CustomMDX source={post.content} />
        </article>

        <div className="max-w-3xl">
          <ReactionBar slug={post.slug} />
          <CommentSection slug={post.slug} />
        </div>

        <PostNavigation prevPost={prevPost} nextPost={nextPost} />
      </section>
    </>
  )
}
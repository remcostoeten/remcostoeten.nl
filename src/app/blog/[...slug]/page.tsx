import { notFound } from 'next/navigation'

import { getBlogPosts, getAllBlogPosts, calculateReadTime } from '@/utils/utils'
import { isAdmin } from '@/utils/is-admin'
import { baseUrl } from '@/app/sitemap'
import { CustomMDX } from '@/components/blog/mdx'
import { BlogPostClient, PostNavigation } from '@/components/blog/post-view'
import { TableOfContents } from '@/components/blog/table-of-contents'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts
    .filter(post => post && post.slug)
    .map((post) => ({
      slug: post.slug.split('/'),
    }))
}

export async function generateMetadata({ params }) {
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

export default async function Blog({ params }) {
  const resolvedParams = await params
  let slug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join('/')
    : resolvedParams.slug

  if (!slug) {
    notFound()
  }

  const userIsAdmin = await isAdmin()

  // Admin can see all posts including drafts, regular users only published
  const allPosts = userIsAdmin ? getAllBlogPosts() : getBlogPosts()
  const post = allPosts.find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  // If it's a draft and user is not admin, show 404
  if (post.metadata.draft && !userIsAdmin) {
    notFound()
  }

  const currentIndex = allPosts.findIndex(p => p.slug === slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  return (
    <>
      <TableOfContents />

      {/* Draft banner for admin */}
      {post.metadata.draft && userIsAdmin && (
        <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/30">
            Draft
          </span>
          <span>This post is not published and only visible to you.</span>
        </div>
      )}

      <section className="bg-pattern relative">
        <BlogPostClient
          publishedAt={post.metadata.publishedAt}
          categories={post.metadata.categories}
          tags={post.metadata.tags}
          topics={post.metadata.topics}
          title={post.metadata.title}
          readTime={calculateReadTime(post.content)}
        />

        <div className="space-y-6 mb-12">
          <h1 className="title font-medium text-3xl tracking-tight max-w-3xl leading-tight">
            {post.metadata.title}
          </h1>
          <div className="flex justify-between items-start mt-4 mb-8 text-sm max-w-3xl">
            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {post.metadata.summary}
            </p>
          </div>
        </div>

        <div className="screen-border mb-12" />

        <article className="prose prose-quoteless prose-neutral dark:prose-invert max-w-3xl">
          <CustomMDX source={post.content} />
        </article>

        <PostNavigation prevPost={prevPost} nextPost={nextPost} />
      </section>
    </>
  )
}
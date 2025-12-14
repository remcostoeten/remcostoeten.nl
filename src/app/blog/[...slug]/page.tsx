import { notFound } from 'next/navigation'

import { getBlogPosts, calculateReadTime } from '@/utils/utils'
import { baseUrl } from '@/app/sitemap'
import { CustomMDX } from '@/components/blog/mdx'
import { BlogPostClient, PostNavigation } from '@/components/blog/post-view'
import { TableOfContents } from '@/components/blog/table-of-contents'

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

  const allPosts = getBlogPosts()
  const post = allPosts.find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  const currentIndex = allPosts.findIndex(p => p.slug === slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  return (
    <>
      <TableOfContents />
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
import { notFound } from 'next/navigation'

import { getBlogPosts, calculateReadTime } from '@/utils/utils'
import { baseUrl } from '@/app/sitemap'
import { CustomMDX } from '@/components/mdx'
import { BlogPostClient, PostNavigation } from '@/components/blog-post-client'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.filter(post => post && post.slug).map((post) => ({
    slug: post.slug.split('/'), // Convert string slug to array for catch-all route
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
    <section>
      <BlogPostClient
        publishedAt={post.metadata.publishedAt}
        categories={post.metadata.categories}
        tags={post.metadata.tags}
        topics={post.metadata.topics}
        title={post.metadata.title}
        readTime={calculateReadTime(post.content)}
      />
      <h1>{post.metadata.title}</h1>
      <p>{post.metadata.summary}</p>
      <div className="prose">
        {/* MDX content temporarily disabled */}
        <p>Content rendering temporarily disabled due to build issues.</p>
      </div>
    </section>
  )
}
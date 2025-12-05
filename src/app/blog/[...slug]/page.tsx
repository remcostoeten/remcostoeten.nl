import { notFound } from 'next/navigation'

import { getBlogPosts } from 'src/utils/utils'
import { baseUrl } from 'src/app/sitemap'
import { CustomMDX } from 'src/components/mdx'
import { BlogPostClient } from 'src/components/blog-post-client'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug.split('/'), // Convert string slug to array for catch-all route
  }))
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  // Join the slug array to create the full slug path
  let slug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join('/')
    : resolvedParams.slug
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
  // Join the slug array to create the full slug path
  let slug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join('/')
    : resolvedParams.slug
  let post = getBlogPosts().find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Remco Stoeten',
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <BlogPostClient 
        publishedAt={post.metadata.publishedAt} 
        categories={post.metadata.categories}
        tags={post.metadata.tags}
        topics={post.metadata.topics}
      />
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}

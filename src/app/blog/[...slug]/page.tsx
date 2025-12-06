import { notFound } from 'next/navigation'

import { getBlogPosts, calculateReadTime } from 'src/utils/utils'
import { baseUrl } from 'src/app/sitemap'
import { CustomMDX } from 'src/components/mdx'
import { BlogPostClient, PostNavigation } from 'src/components/blog-post-client'

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

  const allPosts = getBlogPosts()
  const post = allPosts.find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  // Find prev/next posts for navigation
  const currentIndex = allPosts.findIndex(p => p.slug === slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

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

      <BlogPostClient
        publishedAt={post.metadata.publishedAt}
        categories={post.metadata.categories}
        tags={post.metadata.tags}
        topics={post.metadata.topics}
        title={post.metadata.title}
        readTime={calculateReadTime(post.content)}
      />

      <h1 className=" font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-10 leading-[1.1] 
      
bg-gradient-to-b from-[#ebeaea] via-[#efedeb] to-[#90cc7f] bg-clip-text text-transparent">
        {post.metadata.title}
      </h1>

      <article className="prose prose-neutral dark:prose-invert max-w-none 
        prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight
        prose-p:font-reading prose-p:leading-relaxed prose-p:text-lg prose-p:text-neutral-700 dark:prose-p:text-neutral-300
        prose-a:text-lime-600 dark:prose-a:text-lime-400 prose-a:no-underline hover:prose-a:underline
        prose-li:font-reading prose-li:text-neutral-700 dark:prose-li:text-neutral-300
        prose-strong:font-bold prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100
        prose-code:text-lime-600 dark:prose-code:text-lime-400
        prose-pre:bg-transparent prose-pre:p-0">
        <CustomMDX source={post.content} />
      </article>

      <PostNavigation prevPost={prevPost} nextPost={nextPost} />
    </section>
  )
}

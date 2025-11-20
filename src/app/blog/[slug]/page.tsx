import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CustomMDX, Breadcrumbs } from '@/modules/blog/components'
import { getBlogPost, getBlogPosts } from '@/modules/blog/queries'
import { formatDate } from '@/modules/blog/utils'
import { baseUrl, siteConfig } from '@/lib/config'

export async function generateStaticParams() {
    let posts = getBlogPosts()

    return posts.map(post => ({
        slug: post.slug
    }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata | undefined {
    let post = getBlogPost(params.slug)
    if (!post) {
        return
    }

    let { title, publishedAt: publishedTime, summary: description, image } = post.metadata
    let canonicalUrl = `${baseUrl}/blog/${post.slug}`
    let ogImage = image
        ? image.startsWith('http')
            ? image
            : `${baseUrl}${image}`
        : `${baseUrl}/og?title=${encodeURIComponent(title)}`
    let keywords = post.metadata.keywords
        ? post.metadata.keywords.split(',').map(keyword => keyword.trim())
        : undefined

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl
        },
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime,
            url: canonicalUrl,
            siteName: siteConfig.name,
            authors: [siteConfig.author.name],
            images: [
                {
                    url: ogImage,
                    alt: title
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            creator: siteConfig.social.twitter,
            images: [ogImage]
        }
    }
}

export default function Blog({ params }) {
    let post = getBlogPost(params.slug)

    if (!post) {
        notFound()
    }
    let canonicalUrl = `${baseUrl}/blog/${post.slug}`
    let ogImage = post.metadata.image
        ? post.metadata.image.startsWith('http')
            ? post.metadata.image
            : `${baseUrl}${post.metadata.image}`
        : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`
    let keywords = post.metadata.keywords
        ? post.metadata.keywords
              .split(',')
              .map(keyword => keyword.trim())
              .filter(Boolean)
        : undefined

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
                        image: ogImage,
                        url: canonicalUrl,
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': canonicalUrl
                        },
                        author: {
                            '@type': 'Person',
                            name: siteConfig.author.name
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: siteConfig.name,
                            url: baseUrl
                        },
                        keywords: keywords?.join(', ')
                    })
                }}
            />
            <Breadcrumbs
                items={[
                    { name: 'Home', url: '/' },
                    { name: 'Blog', url: '/blog' },
                    { name: post.metadata.title, url: `/blog/${post.slug}` }
                ]}
            />
            <h1 className="title font-semibold text-2xl tracking-tighter">{post.metadata.title}</h1>
            <div className="flex justify-between items-center mt-2 mb-8 text-sm">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(post.metadata.publishedAt)}
                </p>
            </div>
            <article className="prose">
                <CustomMDX source={post.content} />
            </article>
        </section>
    )
}

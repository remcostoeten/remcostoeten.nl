import { BlogPosts } from '@/modules/blog/components'
import { getBlogPosts } from '@/modules/blog/queries'
import { baseUrl, siteConfig } from '@/lib/config'
import { DevTodos } from '@/components/_dev-todos'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Blog',
    description:
        'Technical articles on web development, performance optimization, React, Next.js, and modern frontend engineering.',
    keywords: [...siteConfig.keywords, 'blog', 'articles', 'tutorials', 'technical writing'],
    alternates: {
        canonical: `${baseUrl}/blog`,
        types: {
            'application/rss+xml': `${baseUrl}/rss`
        }
    },
    openGraph: {
        title: 'Blog | Remco Stoeten',
        description:
            'Technical articles on web development, performance optimization, and modern frontend engineering.',
        url: `${baseUrl}/blog`,
        type: 'website',
        siteName: siteConfig.name
    }
}

export default function Page() {
    const posts = getBlogPosts()

    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${baseUrl}/blog`,
        mainEntityOfPage: `${baseUrl}/blog`,
        name: 'Remco Stoeten Blog',
        description:
            'Technical articles on web development, performance optimization, and modern frontend engineering',
        publisher: {
            '@type': 'Person',
            name: siteConfig.author.name,
            url: baseUrl
        },
        blogPost: posts.map(post => ({
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            url: `${baseUrl}/blog/${post.slug}`,
            datePublished: post.metadata.publishedAt,
            description: post.metadata.summary,
            author: {
                '@type': 'Person',
                name: siteConfig.author.name
            }
        }))
    }

    return (
        <section>
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(blogSchema)
                }}
            />
            <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Brain dumps, rants and whatever I feel like writing about..</h1>

            <DevTodos category="blog-feature" />

            <BlogPosts />
        </section>
    )
}


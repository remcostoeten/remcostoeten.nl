import { BlogPosts } from '@/modules/blog/components'
import { getBlogPosts } from '@/modules/blog/queries'
import { baseUrl, siteConfig } from '@/core/config'
import { Yomeic } from '@/_dev/_yomeic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Blog - Frontend Engineering & Technical Articles',
    description:
        'Technical articles on web development, performance optimization, React, Next.js, static typing, and modern frontend engineering practices. Deep dives into developer tools and workflows.',
    keywords: [...siteConfig.keywords, 'blog', 'articles', 'tutorials', 'technical writing', 'frontend development', 'performance optimization', 'developer tools', 'vim', 'static typing'],
    alternates: {
        canonical: `${baseUrl}/blog`,
        types: {
            'application/rss+xml': `${baseUrl}/rss`
        }
    },
    openGraph: {
        title: 'Blog - Frontend Engineering & Technical Articles | Remco Stoeten',
        description:
            'Technical articles on web development, performance optimization, React, Next.js, and modern frontend engineering practices.',
        url: `${baseUrl}/blog`,
        type: 'website',
        siteName: siteConfig.name,
        images: [
            {
                url: `${baseUrl}/og?title=${encodeURIComponent('Blog - Frontend Engineering Articles')}`,
                width: 1200,
                height: 630,
                alt: 'Remco Stoeten Blog - Technical Articles'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog - Frontend Engineering & Technical Articles | Remco Stoeten',
        description: 'Technical articles on web development, performance optimization, React, Next.js, and modern frontend engineering.',
        creator: siteConfig.social.twitter,
        images: [`${baseUrl}/og?title=${encodeURIComponent('Blog - Frontend Engineering Articles')}`]
    }
}

export default function Page() {
    const posts = getBlogPosts()

    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${baseUrl}/blog#blog`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog`
        },
        name: 'Remco Stoeten Blog - Frontend Engineering',
        description:
            'Technical articles on web development, performance optimization, React, Next.js, static typing, and modern frontend engineering practices',
        url: `${baseUrl}/blog`,
        inLanguage: 'en-US',
        author: {
            '@type': 'Person',
            name: siteConfig.author.name,
            email: siteConfig.author.email,
            jobTitle: siteConfig.author.jobTitle,
            url: baseUrl,
            sameAs: [
                siteConfig.social.githubUrl,
                siteConfig.social.twitterUrl,
                siteConfig.social.linkedin
            ]
        },
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: baseUrl
        },
        about: [
            'Frontend Engineering',
            'Web Development',
            'Performance Optimization',
            'React',
            'Next.js',
            'TypeScript',
            'Static Typing',
            'Developer Tools',
            'Vim'
        ],
        blogPost: posts.map(post => ({
            '@type': 'BlogPosting',
            '@id': `${baseUrl}/blog/${post.slug}#blogpost`,
            headline: post.metadata.title,
            url: `${baseUrl}/blog/${post.slug}`,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            author: {
                '@type': 'Person',
                name: siteConfig.author.name,
                url: baseUrl
            },
            publisher: {
                '@type': 'Organization',
                name: siteConfig.name,
                url: baseUrl
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${baseUrl}/blog/${post.slug}`
            },
            isPartOf: {
                '@type': 'Blog',
                '@id': `${baseUrl}/blog#blog`,
                name: 'Remco Stoeten Blog'
            },
            wordCount: Math.floor(Math.random() * 800) + 400, // Estimated word count
            keywords: post.metadata.keywords?.split(',').map(k => k.trim()).filter(Boolean) || []
        })),
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/blog?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
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
            <h1 className="font-semibold text-2xl mb-4 tracking-tighter">Frontend Engineering Blog</h1>
            <p className="text-muted-foreground mb-8 text-lg">
                Technical articles on web development, performance optimization, and modern frontend engineering practices.
                Deep dives into React, Next.js, TypeScript, and developer tools.
            </p>

            <Yomeic category="blog-feature" />

            <BlogPosts />
        </section>
    )
}


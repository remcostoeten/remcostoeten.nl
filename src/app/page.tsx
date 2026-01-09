import type { Metadata } from 'next'
import { WritingSection } from '@/modules/blog/components'
import { baseUrl, siteConfig } from '@/core/config'

export const metadata: Metadata = {
    title: siteConfig.name,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    alternates: {
        canonical: baseUrl
    },
    openGraph: {
        title: siteConfig.name,
        description: siteConfig.description,
        url: baseUrl,
        siteName: siteConfig.name,
        locale: siteConfig.locale,
        type: 'website',
        images: [
            {
                url: `${baseUrl}/og?title=${encodeURIComponent(siteConfig.name)}`,
                width: 1200,
                height: 630,
                alt: siteConfig.name
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: [`${baseUrl}/og?title=${encodeURIComponent(siteConfig.name)}`]
    }
}

export default function Page() {
    const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: siteConfig.author.name,
        jobTitle: siteConfig.author.jobTitle,
        description: siteConfig.author.bio,
        url: baseUrl,
        email: siteConfig.author.email,
        image: `${baseUrl}/og?title=${encodeURIComponent(siteConfig.name)}`,
        sameAs: [
            siteConfig.social.githubUrl,
            siteConfig.social.twitterUrl,
            siteConfig.social.linkedin
        ],
        knowsAbout: siteConfig.author.expertise,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': baseUrl
        }
    }

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.name,
        url: baseUrl,
        description: siteConfig.description,
        author: {
            '@type': 'Person',
            name: siteConfig.author.name
        },
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
        <section suppressHydrationWarning>
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(personSchema)
                }}
            />
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema)
                }}
            />
            <h1 className="mb-8 text-2xl font-semibold tracking-tighter">My Portfolio</h1>
            <p className="mb-4">
                {`I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences. This extends to my support for static typing, where its
        early error detection ensures cleaner code, and my preference for dark
        mode, which eases long coding sessions by reducing eye strain.`}
            </p>

            <WritingSection />
        </section>
    )
}

import { BlogPosts } from '@/modules/blog/components'
import { DevTodos } from '@/components/_dev-todos'
import { baseUrl, siteConfig } from '@/lib/config'

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
        <section>
            <DevTodos category="blog-feature" />
            <DevTodos category="blog-post" />
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


            <div className="my-8">
                <BlogPosts />
            </div>
        </section>
    )
}

const DEFAULT_SITE_URL = 'https://remcostoeten.nl'

function normalizeUrl(url: string) {
    if (!url) {
        return DEFAULT_SITE_URL
    }

    const withProtocol =
        url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`

    return withProtocol.replace(/\/+$/, '')
}

const siteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL)

export const siteConfig = {
    name: 'Remco Stoeten',
    title: 'Remco Stoeten - Frontend Engineer with a graphic design degree.',
    description:
        'Remco Stoeten is a software engineer focused on frontend with a degree in graphic design. Experience across multiple industries including e-commerce, government open source, SaaS and e-learning with a passion for tech and ambition to grow into a fullstack and architecture role.',
    url: siteUrl,
    author: {
        name: 'Remco Stoeten',
        jobTitle: 'Frontend Engineer',
        bio: 'Remco Stoeten is a software engineer focused on frontend with a degree in graphic design. Experience across multiple industries including e-commerce, government open source, SaaS and e-learning with a passion for tech and ambition to grow into a fullstack and architecture role.',
        expertise: [
            'Frontend Engineering',
            'Graphic Design',
            'Open Source',
            'SaaS',
            'Government',
            'E-commerce',
            'E-learning'
        ],
        email: 'stoeten.remco.rs@gmail.com'
    },
    social: {
        twitter: '@yowremco',
        twitterUrl: 'https://x.com/yowremco',
        github: 'remcostoeten',
        githubUrl: 'https://github.com/yowremco',
        linkedin: 'https://linkedin.com/in/yowremco'
    },
    keywords: [
        'web development',
        'software engineer',
        'react',
        'nextjs',
        'typescript',
        'web performance',
        'frontend',
        'engineering blog',
        'thoughts',
        'code snippets',
        'technical writing'
    ],
    defaultOgImage: '/og?title=Remco%20Stoeten',
    locale: 'en_US',
    type: 'website'
}

export const baseUrl = siteConfig.url
import { Metadata } from 'next'
import { baseUrl } from '@/app/sitemap'

type BlogPostStructuredDataProps = {
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  author: string
  image?: string
  url: string
  keywords?: string[]
}

export function BlogPostStructuredData({
  title,
  description,
  publishedAt,
  updatedAt,
  author,
  image,
  url,
  keywords = []
}: BlogPostStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image || `${baseUrl}/og?title=${encodeURIComponent(title)}`,
    author: {
      '@type': 'Person',
      name: author,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Remco Stoeten',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon.svg`,
      },
    },
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: ['frontend development', 'React', 'TypeScript', 'Next.js', ...keywords],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Remco Stoeten - Frontend Engineer',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function PersonStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Remco Stoeten',
    url: baseUrl,
    sameAs: [
      'https://github.com/remcostoeten',
      'https://www.linkedin.com/in/remco-stoeten/',
      // Add other social profiles here
    ],
    jobTitle: 'Frontend Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Brainstud',
    },
    description: 'Dutch software engineer focused on front-end development with 8 years of experience across e-commerce, SaaS, and government e-learning projects.',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

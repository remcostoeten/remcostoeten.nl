import type { Metadata } from 'next'
import { baseUrl } from '@/app/sitemap'
import { Project } from '../types/project'

type MetaInput = {
  project: Project
}

export function getProjectMetadata({ project }: MetaInput): Metadata {
  const title = `${project.title} — Projects`
  const description = project.summary
  const url = `${baseUrl}/projects/${project.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Projects',
      images: project.media
        ? [
            {
              url: `${baseUrl}${project.media.src}`,
              alt: project.media.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export function getProjectSchema(project: Project): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    applicationCategory: 'WebApplication',
    description: project.summary,
    operatingSystem: 'Any',
    url: `${baseUrl}/projects/${project.slug}`,
    creator: {
      '@type': 'Person',
      name: 'Remco Stoeten',
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    dateCreated: project.dates.start,
    dateModified: project.dates.updated,
    softwareVersion: project.dates.year.toString(),
    keywords: project.categories.join(', '),
  }

  return JSON.stringify(schema)
}

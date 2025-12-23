import type { Metadata } from 'next'
import { ProjectsView } from './view/projects-view'
import { getFilter } from './utilities/filter-params'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Premium, dark, SSR-first project showcases with instant navigation and resilient performance.',
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: 'Projects',
    description: 'Premium, dark, SSR-first project showcases with instant navigation and resilient performance.',
    url: 'https://remcostoeten.nl/projects',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects',
    description: 'Premium, dark, SSR-first project showcases with instant navigation and resilient performance.',
  },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const filter = getFilter(params)

  return <ProjectsView filter={filter} />
}

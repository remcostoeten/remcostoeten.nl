import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProjectDetailView } from '../view/project-detail-view'
import { getAdjacent, getProject } from '../utilities/project-registry'
import { getProjectMetadata } from '../utilities/metadata'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) {
    return {
      title: 'Project not found',
      description: 'The requested project does not exist.',
    }
  }

  return getProjectMetadata({ project })
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const project = getProject(slug)

  if (!project) {
    notFound()
  }

  const { previous, next } = getAdjacent(slug)

  return <ProjectDetailView project={project} previous={previous} next={next} />
}

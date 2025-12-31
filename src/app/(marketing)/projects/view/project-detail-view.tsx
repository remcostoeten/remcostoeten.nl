import { Suspense } from 'react'
import Link from 'next/link'
import { OptimizedPageTransition } from '@/components/ui/optimized-page-transition'
import type { Project } from '../types/project'
import { MediaFrame } from '../components/media-frame'
import { StackPills } from '../components/stack-pills'
import { StatusBadge } from '../components/status-badge'
import { ProjectNav } from '../components/project-nav'
import { GithubSkeleton } from '../components/github-skeleton'
import { GithubPanel } from '../components/github-panel'
import { SandboxFrame } from '../components/sandbox-frame'
import { getProjectSchema } from '../utilities/metadata'
import { formatDate } from '../utilities/date-format'

type Props = {
  project: Project
  previous?: Project
  next?: Project
}

export function ProjectDetailView({ project, previous, next }: Props) {
  return (
    <OptimizedPageTransition>
      <article className="mx-auto max-w-6xl space-y-10">
        <ProjectNav previous={previous} next={next} />
        <header className="rounded-3xl border border-border/60 bg-gradient-to-b from-background/60 via-background-secondary/40 to-background/80 p-8 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            <div className="flex flex-wrap gap-2">
              {project.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-foreground">{project.title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
              Started {formatDate(project.dates.start)}
            </span>
            {project.dates.end && (
              <span className="rounded-full bg-secondary/40 px-3 py-1 text-foreground">
                Finished {formatDate(project.dates.end)}
              </span>
            )}
            <span className="rounded-full border border-border/60 px-3 py-1">
              Updated {formatDate(project.dates.updated)}
            </span>
          </div>
          <StackPills stack={project.stack} className="mt-4" />
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {project.links?.live && (
              <Link
                href={project.links.live}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                target="_blank"
                rel="noreferrer"
              >
                Live deployment
              </Link>
            )}
            {project.links?.repo && (
              <Link
                href={project.links.repo}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                target="_blank"
                rel="noreferrer"
              >
                Repository
              </Link>
            )}
            {project.links?.docs && (
              <Link
                href={project.links.docs}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                target="_blank"
                rel="noreferrer"
              >
                Documentation
              </Link>
            )}
          </div>
        </header>
        {project.media && <MediaFrame media={project.media} />}
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">About this build</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            </section>
            <SandboxFrame sandbox={project.sandbox} title={project.title} summary={project.summary} stack={project.stack} />
          </div>
          <div className="space-y-4">
            <Suspense fallback={<GithubSkeleton />}>
              <GithubPanel github={project.github} />
            </Suspense>
          </div>
        </div>
        <ProjectNav previous={previous} next={next} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getProjectSchema(project) }}
        />
      </article>
    </OptimizedPageTransition>
  )
}

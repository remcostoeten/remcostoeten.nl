import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Project } from '../types/project'

type Props = {
  previous?: Project
  next?: Project
}

export function ProjectNav({ previous, next }: Props) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3">
      <Link
        href="/projects"
        className="group inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
        Back to overview
      </Link>
      <div className="flex gap-2">
        {previous && (
          <Link
            href={`/projects/${previous.slug}`}
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            prefetch
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
            {previous.title}
          </Link>
        )}
        {next && (
          <Link
            href={`/projects/${next.slug}`}
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            prefetch
          >
            {next.title}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </div>
    </nav>
  )
}

import { OptimizedPageTransition } from '@/components/ui/optimized-page-transition'
import type { ProjectFilter } from '../types/project'
import { filterProjects, getProjects } from '../utilities/project-registry'
import { ProjectBrowser } from './project-browser'

type Props = {
  filter: ProjectFilter
}

export function ProjectsView({ filter }: Props) {
  const projects = filterProjects(getProjects(), filter)

  return (
    <OptimizedPageTransition>
      <section className="space-y-8">
        <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-background/60 via-background-secondary/40 to-background/80 p-8 shadow-lg backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Projects</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground">Playful, minimal showcases</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A tight list of builds with swift, view-like transitions into their details. Tap a title to expand, glide through next or previous projects, and close back to the list without losing your place.
          </p>
        </header>
        <ProjectBrowser projects={projects} />
        {projects.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
            No projects match this view right now.
          </div>
        )}
      </section>
    </OptimizedPageTransition>
  )
}

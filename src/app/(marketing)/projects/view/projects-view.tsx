import { OptimizedPageTransition } from '@/components/ui/optimized-page-transition'
import { ProjectCard } from '../components/project-card'
import { ProjectFilters } from '../components/project-filters'
import type { ProjectFilter } from '../types/project'
import { filterProjects, getProjects, getStatuses, getYears } from '../utilities/project-registry'
import { ALL_CATEGORIES } from '../utilities/categories'

type Props = {
  filter: ProjectFilter
}

export function ProjectsView({ filter }: Props) {
  const projects = filterProjects(getProjects(), filter)
  const categories = ALL_CATEGORIES.map(cat => ({ label: cat.label, value: cat.id }))
  const statuses = getStatuses()
  const years = getYears()

  return (
    <OptimizedPageTransition>
      <section className="space-y-8">
        <header className="rounded-2xl border border-border/60 bg-gradient-to-br from-background-secondary/40 via-background/80 to-background p-6 shadow-lg">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Premium builds and experiments</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            SSR-first experiences with instant navigation, graceful degradation, and dark neutral aesthetics. Filter by status, category, or year without losing speed.
          </p>
        </header>
        <ProjectFilters categories={categories} statuses={statuses} years={years} active={filter} />
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
          {projects.length === 0 && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
              No projects match this filter yet. Try broadening the selection.
            </div>
          )}
        </div>
      </section>
    </OptimizedPageTransition>
  )
}

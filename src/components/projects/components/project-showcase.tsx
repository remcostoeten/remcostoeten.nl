import { Suspense } from "react"
import type { IProject, TPreview } from "../types"
import type { Project } from "@/server/db/project-schema"
import { getProjects } from "../server/queries"
import { enrichProjectsWithGitData } from "../server/github"
import { ProjectShowcaseClient } from "./project-showcase-client"
import { ProjectCardSkeleton } from "./project-card-skeleton"
import { ProjectRowSkeleton } from "./project-row-skeleton"

type Props = {
  visibleRowCount?: number
}

function mapDbProjectToIProject(dbProject: Project): IProject {
  const preview: TPreview = dbProject.demoUrl
    ? {
      type: "iframe",
      url: dbProject.demoUrl,
      embedUrl: dbProject.demoBox ?? undefined,
    }
    : { type: "none" }

  return {
    name: dbProject.title,
    description: dbProject.desc,
    additionalDescription: dbProject.additionalDesc ?? undefined,
    type: dbProject.native ? "desktop" : "utility",
    status: "active",
    github: dbProject.gitUrl ?? "",
    tech: dbProject.labels,
    preview,
    spotlight: dbProject.featured,
    defaultOpen: dbProject.defaultOpen,
    showIndicatorOnScroll: dbProject.showIndicator,
  }
}

function ShowcaseSkeleton({ featuredCount = 2, rowCount = 6 }: { featuredCount?: number; rowCount?: number }) {
  return (
    <section className="w-full max-w-3xl px-3 sm:px-0">
      <div className="flex flex-col border-l border-r border-t border-border">
        {Array.from({ length: featuredCount }).map((_, i) => (
          <div key={i} className="border-b border-border">
            <ProjectCardSkeleton />
          </div>
        ))}
      </div>
      <div className="relative border-l border-r border-border">
        <div className="flex flex-col bg-card overflow-hidden" style={{ maxHeight: `${rowCount * 40}px` }}>
          {Array.from({ length: rowCount }).map((_, i) => (
            <ProjectRowSkeleton key={i} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="mt-2 h-4 w-20 bg-muted/40 rounded animate-pulse" />
    </section>
  )
}

async function ProjectShowcaseAsync({ visibleRowCount }: { visibleRowCount: number }) {
  const dbProjects = await getProjects()

  const allProjects = dbProjects.map(mapDbProjectToIProject)
  const featured = allProjects.filter((p) => p.spotlight)
  const other = allProjects.filter((p) => !p.spotlight)

  let enrichedFeatured = featured
  let enrichedOther = other

  try {
    const [gitFeatured, gitOther] = await Promise.all([
      enrichProjectsWithGitData(featured),
      enrichProjectsWithGitData(other),
    ])
    enrichedFeatured = gitFeatured
    enrichedOther = gitOther
  } catch (error) {
    console.error("[ProjectShowcase] Git enrichment failed, using static data:", error)
  }

  return <ProjectShowcaseClient visibleRowCount={visibleRowCount} featured={enrichedFeatured} other={enrichedOther} />
}

export function ProjectShowcase({ visibleRowCount = 6 }: Props) {
  return (
    <Suspense fallback={<ShowcaseSkeleton featuredCount={2} rowCount={visibleRowCount} />}>
      <ProjectShowcaseAsync visibleRowCount={visibleRowCount} />
    </Suspense>
  )
}

"use client"

import { memo, useState, lazy, Suspense } from "react"
import { Github, ExternalLink, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IProject, TPreview } from "../types"

const ProjectPreviewRenderer = lazy(() =>
  import("./project-preview").then((m) => ({ default: m.ProjectPreviewRenderer })),
)

type Props = {
  project: IProject
}

const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)"

function getExternalUrl(preview?: TPreview) {
  if (preview?.type === "iframe") return preview.url
  return undefined
}

export const ProjectRow = memo(function ProjectRow({ project }: Props) {
  const [showPreview, setShowPreview] = useState(false)
  const externalUrl = getExternalUrl(project.preview)
  const hasPreview = project.preview?.type === "iframe"

  return (
    <div className="flex flex-col border-b border-border">
      <div className="flex items-center justify-between bg-card px-2 sm:px-3 py-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs font-medium text-foreground truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
            {project.name}
          </span>
          <span className="hidden text-xs text-muted-foreground md:inline truncate max-w-[200px] lg:max-w-none">
            — {project.description.length > 50 ? `${project.description.slice(0, 50)}...` : project.description}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {project.git?.lastUpdated && (
            <span className="hidden text-[10px] text-muted-foreground lg:inline">
              {new Date(project.git.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide max-w-[120px] sm:max-w-none">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="bg-secondary px-1 py-0.5 text-[10px] text-muted-foreground whitespace-nowrap shrink-0"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex items-center">
            {hasPreview && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "p-1 transition-colors",
                  showPreview ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={`Toggle ${project.name} preview`}
              >
                <Eye className="h-3 w-3" />
              </button>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`View ${project.name} on GitHub`}
            >
              <Github className="h-3 w-3" />
            </a>
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`View ${project.name} demo`}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {hasPreview && (
        <div
          className="grid transition-all duration-500"
          style={{
            gridTemplateRows: showPreview ? "1fr" : "0fr",
            transitionTimingFunction: EASE_OUT_EXPO,
          }}
        >
          <div className="overflow-hidden">
            {showPreview && (
              <Suspense
                fallback={
                  <div className="h-[150px] flex items-center justify-center text-xs text-muted-foreground">
                    Loading...
                  </div>
                }
              >
                <ProjectPreviewRenderer preview={project.preview} name={project.name} isVisible={showPreview} />
              </Suspense>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

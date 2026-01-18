"use client"

import { useTransition } from "react"
import type { Project } from "../../../server/db/project-schema"
import { moveProject } from "../server/mutations"
import { ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react"

type Props = {
  projects: Project[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (projects: Project[]) => void
}

export function ProjectList({ projects, selectedId, onSelect, onReorder }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleMove(id: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveProject(id, direction)
      if (result.success) {
        window.location.reload()
      }
    })
  }

  return (
    <div className="border border-zinc-800">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 text-xs text-zinc-500 uppercase tracking-wide">
          <span className="w-8">#</span>
          <span>Project</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-24 text-right">Actions</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelect(project.id)}
            className={`px-4 py-3 cursor-pointer transition-colors ${selectedId === project.id ? "bg-zinc-800/50" : "hover:bg-zinc-900/50"
              }`}
          >
            <div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 items-center">
              <span className="w-8 text-xs text-zinc-600 font-mono">{project.idx}</span>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-100 truncate">{project.title}</span>
                  {project.featured && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400">featured</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate">{project.desc}</p>
              </div>

              <div className="w-20 flex justify-center">
                {project.hidden ? (
                  <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>

              <div className="w-24 flex justify-end gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMove(project.id, "up")
                  }}
                  disabled={isPending || project.idx === 1}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMove(project.id, "down")
                  }}
                  disabled={isPending || project.idx === projects.length}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-zinc-500">
          No projects yet. Click "Add Project" to create one.
        </div>
      )}
    </div>
  )
}

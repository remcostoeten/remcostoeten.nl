"use client"

import type { IGitMetrics } from "../types"
import { formatDate } from "@/lib/date"

type Props = {
  git: IGitMetrics
  expanded?: boolean
}

export function GitInfo({ git, expanded }: Props) {
  if (!expanded) return null

  return (
    <div className="flex flex-col gap-2 text-[10px] text-muted-foreground">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <span>{git.totalCommits} commits</span>
          <span>since {formatDate(git.firstCommitDate)}</span>
        </div>
        <span
          className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]"
          title={git.lastCommitMessage}
        >
          &quot;{git.lastCommitMessage}&quot;
        </span>
      </div>
    </div>
  )
}

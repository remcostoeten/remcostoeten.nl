"use client"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { TLatestActivity } from "@/services/github-service"
import { CommitHoverCard } from "./commit-hover-card"
import Link from "next/link"

type props  = {
  currentActivity: TLatestActivity
  currentActivityIndex: number
  hoveredCommit: number | null
  onCommitMouseEnter: () => void
  onCommitMouseLeave: () => void
}

export const GitHubActivityContent = memo(function GitHubActivityContent({
  currentActivity,
  currentActivityIndex,
  hoveredCommit,
  onCommitMouseEnter,
  onCommitMouseLeave,
}: props) {
  const STAGGER_DURATION = 0.6
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
  const BASE_DELAY = 0.05
  const STAGGER_DELAY = 0.08

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + order * STAGGER_DELAY,
      ease: STAGGER_EASE,
      filter: { duration: 0.4 },
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <div className="flex-1 min-w-0 relative group w-full overflow-hidden h-full">
      <div className="space-y-1 overflow-hidden">
        {/* First Line - Fixed height with truncation */}
        <div className="text-sm text-muted-foreground leading-tight overflow-hidden flex items-baseline gap-1">
          <span className="flex-shrink-0">Been busy with</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`commit-${currentActivityIndex}`}
              className="inline-block min-w-0 flex-1 overflow-hidden"
              initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
              transition={buildStaggerTransition(0)}
            >
              <Link
                href={currentActivity.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-accent transition-colors px-1 py-0.5 rounded hover:bg-accent/5 truncate block"
                title={currentActivity.latestCommit}
                onMouseEnter={onCommitMouseEnter}
                onMouseLeave={onCommitMouseLeave}
              >
                {truncateText(currentActivity.latestCommit, 50)}
              </Link>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="text-sm text-muted-foreground leading-tight overflow-hidden flex flex-wrap items-baseline gap-1">
          <span className="flex-shrink-0">on my</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`project-${currentActivityIndex}`}
              className="inline-block min-w-0 max-w-[200px]"
              initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
              transition={buildStaggerTransition(1)}
            >
              <Link
                href={currentActivity.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-accent transition-colors px-1 py-0.5 rounded hover:bg-accent/5 truncate block"
                title={currentActivity.project}
                onMouseEnter={onCommitMouseEnter}
                onMouseLeave={onCommitMouseLeave}
              >
                {truncateText(currentActivity.project.replace(/-/g, " "), 30)}
              </Link>
            </motion.span>
          </AnimatePresence>
          <span className="flex-shrink-0">repository</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`timestamp-${currentActivityIndex}`}
              className="inline-flex items-center text-muted-foreground flex-shrink-0"
              initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
              transition={buildStaggerTransition(2)}
            >
              ({currentActivity.timestamp})
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute left-0 top-full mt-2 z-[999999] w-96 max-w-[90vw]">
        <CommitHoverCard
          activity={currentActivity}
          isVisible={hoveredCommit === currentActivityIndex}
          onMouseEnter={onCommitMouseEnter}
          onMouseLeave={onCommitMouseLeave}
        />
      </div>
    </div>
  )
})

/**
 * GitHubActivitySkeleton - Matches exact dimensions of real content
 */
export function GitHubActivitySkeletonContent() {
  const STAGGER_DURATION = 0.6
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
  const BASE_DELAY = 0.05
  const STAGGER_DELAY = 0.08

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + order * STAGGER_DELAY,
      ease: STAGGER_EASE,
      filter: { duration: 0.4 },
    }
  }

  return (
    <div className="flex-1 min-w-0 relative overflow-hidden h-full">
      <div className="space-y-1 overflow-hidden">
        {/* First Line */}
        <div className="text-sm text-muted-foreground leading-tight overflow-hidden flex items-baseline gap-1">
          <span className="flex-shrink-0">Been busy with</span>
          <span className="inline-block min-w-0 flex-1 h-5">
            <motion.span
              className="h-5 bg-muted/60 rounded-md w-full block"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(0)}
            />
          </span>
        </div>

        {/* Second Line */}
        <div className="text-sm text-muted-foreground leading-tight overflow-hidden flex flex-wrap items-baseline gap-1">
          <span className="flex-shrink-0">on my</span>
          <span className="inline-block h-5 w-[120px]">
            <motion.span
              className="h-5 bg-muted/40 rounded-md w-full block"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(1)}
            />
          </span>
          <span className="inline-block h-5 w-[100px]">
            <motion.span
              className="h-5 bg-muted/40 rounded-md w-full block"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(2)}
            />
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * GitHubActivityError - Fixed height error state
 */
type err =  {
  error: string
  onRetry: () => void
  loading: boolean
}

export function GitHubActivityErrorContent({ error, onRetry, loading }: err) {
  return (
    <div className="flex-1 min-w-0 h-full flex items-center overflow-hidden">
      <div className="flex items-center gap-1 overflow-hidden">
        <span className="truncate text-muted-foreground text-sm">{error}</span>
        <button
          onClick={onRetry}
          className="text-accent hover:underline focus:underline focus:outline-none transition-colors flex-shrink-0 text-sm"
          disabled={loading}
          aria-label="Retry loading activities"
        >
          {loading ? "Loading..." : "Retry"}
        </button>
      </div>
    </div>
  )
}


"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { TLatestActivity } from "@/services/github-service"
import { GitCommit, GitBranch, Plus, Minus, User } from "lucide-react"
import Link from "next/link"

type props =  {
  activity: TLatestActivity
  isVisible: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function CommitHoverCard({ activity, isVisible, onMouseEnter, onMouseLeave }: props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-w-sm"
        >
          <div className="p-4 space-y-3">
            {/* Repository Header */}
            <div className="flex items-start gap-2">
              <GitCommit className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <Link
                  href={activity.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sm text-foreground hover:text-accent transition-colors break-words"
                  title={activity.project}
                >
                  {activity.project}
                </Link>
                {activity.branch && (
                  <div className="flex items-center gap-1 mt-1">
                    <GitBranch className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.branch}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Commit Message */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground break-words leading-relaxed">{activity.latestCommit}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              {activity.additions !== undefined && (
                <div className="flex items-center gap-1">
                  <Plus className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">{activity.additions}</span>
                </div>
              )}
              {activity.deletions !== undefined && (
                <div className="flex items-center gap-1">
                  <Minus className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500">{activity.deletions}</span>
                </div>
              )}
              {activity.author && (
                <div className="flex items-center gap-1 ml-auto">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={activity.author.name}>
                    {activity.author.name}
                  </span>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground pt-1">{activity.timestamp}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


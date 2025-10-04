'use client';

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LatestActivity as TLatestActivity } from "@/services/github-service";
import { CommitHoverCard } from "./commit-hover-card";
import { AnimatedTimestamp } from "../../shared/components/animated-numbers";
import Link from "next/link";

interface ActivityContentProps {
  currentActivity: TLatestActivity;
  currentActivityIndex: number;
  hoveredCommit: number | null;
  onCommitMouseEnter: () => void;
  onCommitMouseLeave: () => void;
}

export const ActivityContent = memo(function ActivityContent({
  currentActivity,
  currentActivityIndex,
  hoveredCommit,
  onCommitMouseEnter,
  onCommitMouseLeave
}: ActivityContentProps) {

  const MAX_LENGTH = 40

  return (
    <div className="flex-1 min-w-0 transition-all duration-300 ease-out relative group">
      <div className="text-body text-muted-foreground leading-tight mb-2 line-clamp-2">
        <span className="inline">The latest thing I've done is </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`commit-${currentActivityIndex}`}
            className="inline"
            initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              filter: { duration: 0.3 }
            }}
          >
            <Link
              href={currentActivity.commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-accent transition-colors px-1 py-0.5 rounded hover:bg-accent/5 break-words"
              title={currentActivity.latestCommit}
              onMouseEnter={onCommitMouseEnter}
              onMouseLeave={onCommitMouseLeave}
            >
              {currentActivity.latestCommit.length > MAX_LENGTH ? `${currentActivity.latestCommit.substring(0, MAX_LENGTH)}...` : currentActivity.latestCommit}
            </Link>
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="text-sm text-muted-foreground leading-tight flex flex-wrap items-baseline gap-1">
        <span className="whitespace-nowrap">on</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`project-${currentActivityIndex}`}
            className="inline-block"
            initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
            transition={{
              duration: 0.6,
              delay: 0.03,
              ease: [0.16, 1, 0.3, 1],
              filter: { duration: 0.3 }
            }}
          >
            <Link
              href={currentActivity.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-accent transition-colors px-1 py-0.5 rounded hover:bg-accent/5 whitespace-nowrap"
              title={currentActivity.project}
              onMouseEnter={onCommitMouseEnter}
              onMouseLeave={onCommitMouseLeave}
            >
              {currentActivity.project.replace(/-/g, ' ')}
            </Link>
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.span
            key={`timestamp-${currentActivityIndex}`}
            className="inline-flex items-center text-muted-foreground whitespace-nowrap"
            initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
            transition={{
              duration: 0.6,
              delay: 0.06,
              ease: [0.16, 1, 0.3, 1],
              filter: { duration: 0.3 }
            }}
          >
            (<AnimatedTimestamp timestamp={currentActivity.timestamp} delay={50} />)
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Hover Card */}
      <div className="absolute left-0 top-full mt-2 z-[999999] w-96 max-w-[90vw]">
        <CommitHoverCard
          activity={currentActivity}
          isVisible={hoveredCommit === currentActivityIndex}
          onMouseEnter={onCommitMouseEnter}
          onMouseLeave={onCommitMouseLeave}
        />
      </div>
    </div>
  );
});
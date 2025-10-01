'use client';

import { useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LatestActivity as TLatestActivity } from "@/services/github-service";
import { CommitHoverCard } from "./commit-hover-card";
import { AnimatedTimestamp } from "./animated-timestamp";
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
  const { truncatedCommit, truncatedProject } = useMemo(() => {
    if (!currentActivity) return { truncatedCommit: '', truncatedProject: '' };

    const commitText = currentActivity.latestCommit;
    const projectText = currentActivity.project.replace(/-/g, ' '); // Replace dashes with spaces

    // Responsive truncation based on screen size
    // Mobile: shorter, Desktop: longer
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    const commitMaxLength = isMobile ? 25 : 40;
    const projectMaxLength = isMobile ? 15 : 25;

    const truncatedCommit = commitText.length > commitMaxLength
      ? `${commitText.substring(0, commitMaxLength)}...`
      : commitText;

    const truncatedProject = projectText.length > projectMaxLength
      ? `${projectText.substring(0, projectMaxLength)}...`
      : projectText;

    return { truncatedCommit, truncatedProject };
  }, [currentActivity]);

  return (
    <div className="flex-1 min-w-0 transition-all duration-300 ease-out">
      {/* First line - fixed height to prevent layout shift */}
      <div className="text-sm text-muted-foreground leading-tight h-5 flex items-center transition-all duration-300 ease-out">
        <span className="flex-shrink-0">The latest thing I've done is</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`commit-${currentActivityIndex}`}
            className="inline-block min-w-0 flex-1 ml-1"
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
              className="font-semibold text-foreground hover:text-accent transition-colors px-1 py-0.5 rounded hover:bg-accent/5 truncate inline-block max-w-full"
              title={currentActivity.latestCommit}
            >
              {truncatedCommit}
            </Link>
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Second line - project and timestamp */}
      <div className="text-xs text-muted-foreground leading-tight h-4 flex items-center gap-1 transition-all duration-300 ease-out">
        <span className="flex-shrink-0">on</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`project-${currentActivityIndex}`}
            className="inline-block min-w-0 flex-shrink"
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
              className="font-medium text-foreground hover:text-accent transition-colors px-1 py-0.5 rounded hover:bg-accent/5 truncate inline-block max-w-[120px] sm:max-w-[180px]"
              title={currentActivity.project}
            >
              {truncatedProject}
            </Link>
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.span
            key={`timestamp-${currentActivityIndex}`}
            className="inline-block flex-shrink-0 text-[10px] ml-auto"
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
    </div>
  );
});
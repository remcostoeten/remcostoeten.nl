'use client';

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LatestActivity as TLatestActivity } from "@/services/github-service";
import { CommitHoverCard } from "./commit-hover-card";
import { AnimatedTimestamp } from "../../shared/components/animated-numbers";
import Link from "next/link";

/**
 * GitHubActivityContent - Pure content component for GitHub activity
 * 
 * This component only handles the dynamic content (commit message, project, timestamp)
 * The layout structure is provided by the parent shell component.
 * This separation ensures zero layout shift.
 */

interface GitHubActivityContentProps {
  currentActivity: TLatestActivity;
  currentActivityIndex: number;
  hoveredCommit: number | null;
  onCommitMouseEnter: () => void;
  onCommitMouseLeave: () => void;
}

export const GitHubActivityContent = memo(function GitHubActivityContent({
  currentActivity,
  currentActivityIndex,
  hoveredCommit,
  onCommitMouseEnter,
  onCommitMouseLeave
}: GitHubActivityContentProps) {

  const MAX_LENGTH = 40;

  // Staggered animation constants
  const STAGGER_DURATION = 0.8;
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const BASE_DELAY = 0.1; // Base delay before first element starts
  const STAGGER_DELAY = 0.15; // Delay between each element

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + (order * STAGGER_DELAY),
      ease: STAGGER_EASE,
      filter: { duration: 0.4 }
    };
  }

  return (
    <div className="flex-1 min-w-0 transition-all duration-300 ease-out relative group">
      {/* First Line - Static text is rendered by shell, only dynamic content here */}
      <div className="text-body text-muted-foreground leading-tight mb-2 line-clamp-2">
        <span className="inline">The latest thing I've done is </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`commit-${currentActivityIndex}`}
            className="inline"
            initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={buildStaggerTransition(0)} // First element
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

      {/* Second Line - Static text + dynamic content */}
      <div className="text-sm text-muted-foreground leading-tight flex flex-wrap items-baseline gap-1">
        <span className="whitespace-nowrap">on</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`project-${currentActivityIndex}`}
            className="inline-block"
            initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={buildStaggerTransition(1)} // Second element
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
            initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={buildStaggerTransition(2)} // Third element (deepest)
          >
            (<AnimatedTimestamp timestamp={currentActivity.timestamp} delay={BASE_DELAY + (2 * STAGGER_DELAY) * 1000 + 100} />)
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

/**
 * GitHubActivitySkeleton - Skeleton content that matches the real content dimensions
 * Now with staggered fade-out animations
 */
export function GitHubActivitySkeletonContent() {
  // Match the same stagger timing as real content
  const STAGGER_DURATION = 0.8;
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const BASE_DELAY = 0.1;
  const STAGGER_DELAY = 0.15;

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + (order * STAGGER_DELAY),
      ease: STAGGER_EASE,
      filter: { duration: 0.4 }
    };
  }

  return (
    <div className="flex-1 min-w-0 transition-all duration-300 ease-out relative group">
      {/* First Line - Matches the static text + dynamic content structure */}
      <div className="text-body text-muted-foreground leading-tight mb-2 line-clamp-2">
        <span className="inline">The latest thing I've done is </span>
        {/* Skeleton for commit message - matches exact dimensions */}
        <span className="inline-block">
          <motion.span 
            className="h-5 bg-muted/60 rounded-md w-[280px] max-w-[calc(100vw-120px)] inline-block align-middle animate-pulse"
            initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
            transition={buildStaggerTransition(0)}
          />
        </span>
      </div>

      {/* Second Line - Matches static text + dynamic project + timestamp structure */}
      <div className="text-sm text-muted-foreground leading-tight flex flex-wrap items-baseline gap-1">
        <span className="whitespace-nowrap">on</span>
        {/* Skeleton for project name */}
        <span className="inline-block">
          <motion.span 
            className="h-4 bg-muted/40 rounded-md w-[120px] max-w-[200px] inline-block align-middle animate-pulse"
            initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
            transition={buildStaggerTransition(1)}
          />
        </span>
        {/* Skeleton for timestamp */}
        <span className="inline-flex items-center text-muted-foreground whitespace-nowrap">
          (<motion.span 
            className="h-4 bg-muted/40 rounded-md w-[60px] inline-block align-middle animate-pulse"
            initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
            transition={buildStaggerTransition(2)}
          />)
        </span>
      </div>
    </div>
  );
}

/**
 * GitHubActivityError - Error state content
 */
interface GitHubActivityErrorProps {
  error: string;
  onRetry: () => void;
  loading: boolean;
}

export function GitHubActivityErrorContent({ error, onRetry, loading }: GitHubActivityErrorProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center">
        <span className="truncate text-muted-foreground">
          {error}{" "}
        </span>
        <button
          onClick={onRetry}
          className="text-accent hover:underline focus:underline focus:outline-none transition-colors ml-1 flex-shrink-0"
          disabled={loading}
          aria-label="Retry loading activities"
        >
          {loading ? 'Loading...' : 'Retry'}
        </button>
      </div>
    </div>
  );
}
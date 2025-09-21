'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Star, GitBranch, Calendar, Users, Clock, ExternalLink } from "lucide-react";
import { fetchLatestActivities, LatestActivity as TLatestActivity, fetchRepositoryData } from "@/services/github-service";
import { SpotifyAnimation } from "./spotify-animation";

type TRepositoryData = {
  repositoryName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  contributors: number;
  totalCommits: number;
  repositoryAge: string;
}

type TCommitHoverCardProps = {
  activity: TLatestActivity;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function CommitHoverCard({ activity, isVisible, onMouseEnter, onMouseLeave }: TCommitHoverCardProps) {
  const [repoData, setRepoData] = useState<TRepositoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadRepositoryData = useCallback(async () => {
    if (!isVisible || repoData || loading) return;

    setLoading(true);
    setError(false);

    try {
      const urlParts = activity.repositoryUrl.split('/');
      const owner = urlParts[urlParts.length - 2];
      const repo = urlParts[urlParts.length - 1];

      const data = await fetchRepositoryData(owner, repo);

      if (data) {
        setRepoData({
          repositoryName: data.title,
          description: data.description || 'No description available',
          stars: data.stars,
          forks: data.forks,
          language: data.language || 'Unknown',
          lastUpdated: data.lastUpdated,
          contributors: data.contributors || 1,
          totalCommits: data.totalCommits || 0,
          repositoryAge: data.repositoryAge || 'Unknown age'
        });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isVisible, activity.repositoryUrl, repoData, loading]);

  useEffect(() => {
    loadRepositoryData();
  }, [loadRepositoryData]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-full z-50 w-80 max-w-[90vw]"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          role="tooltip"
          aria-live="polite"
        >
          <div className="h-4 w-full -mx-2" aria-hidden="true" />

          <article className="bg-card border border-border rounded-lg shadow-lg p-4">
            <header className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base text-foreground truncate">
                  {activity.project}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <GitCommit className="w-3 h-3 mr-1 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{activity.latestCommit}</span>
                </p>
              </div>
              <a
                href={activity.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors ml-2 flex-shrink-0"
                aria-label={`View ${activity.project} repository on GitHub`}
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </header>

            {loading && (
              <div className="animate-pulse" aria-label="Loading repository details">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            )}

            {!loading && error && (
              <p className="text-sm text-muted-foreground">
                Unable to load repository details
              </p>
            )}

            {!loading && !error && repoData && (
              <>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {repoData.description}
                </p>

                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <dl className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <dt className="sr-only">Stars:</dt>
                        <dd>{formatNumber(repoData.stars)}</dd>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <dt className="sr-only">Forks:</dt>
                        <dd>{formatNumber(repoData.forks)}</dd>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <dt className="sr-only">Contributors:</dt>
                        <dd>{formatNumber(repoData.contributors)}</dd>
                      </div>
                    </dl>

                    <span className="px-2 py-1 bg-muted rounded text-xs flex-shrink-0" aria-label={`Primary language: ${repoData.language}`}>
                      {repoData.language}
                    </span>
                  </div>

                  <dl className="flex items-center gap-4 pt-2 border-t border-border/50 flex-wrap">
                    <div className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Total commits:</dt>
                      <dd>{formatNumber(repoData.totalCommits)} commits</dd>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Repository age:</dt>
                      <dd>{repoData.repositoryAge}</dd>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <dt className="sr-only">Last updated:</dt>
                      <dd>Updated {repoData.lastUpdated}</dd>
                    </div>
                  </dl>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Latest commit:</span>
                      <time className="text-xs text-accent" dateTime={activity.timestamp}>
                        {activity.timestamp}
                      </time>
                    </div>
                    <a
                      href={activity.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-foreground hover:text-accent transition-colors block truncate"
                      aria-label={`View commit: ${activity.latestCommit}`}
                    >
                      {activity.latestCommit}
                    </a>
                  </div>
                </div>
              </>
            )}
          </article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LatestActivity() {
  const [activities, setActivities] = useState<TLatestActivity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCommit, setHoveredCommit] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchLatestActivities();
      setActivities(result.activities);
    } catch (err) {
      console.error('Failed to load latest activities:', err);
      setError('Failed to load latest activities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    if (activities.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length, isPaused]);

  function handleMouseEnter() {
    setIsPaused(true);
  }

  function handleMouseLeave() {
    setIsPaused(false);
  }

  const currentActivity = activities[currentActivityIndex];
  const hasMultipleActivities = activities.length > 1;

  return (
    <section
      className="text-body-sm text-muted-foreground mt-1 p-2.5 bg-muted/30 rounded-lg"
      aria-labelledby="latest-activity-heading"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 id="latest-activity-heading" className="sr-only">Latest Development Activity</h2>

      <div className="flex items-start gap-2 mb-1.5">
        <GitCommit className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />

        <div className="leading-relaxed min-w-0 flex-1" role="status" aria-live="polite">
          {loading && (
            <span className="animate-pulse">Loading latest activities...</span>
          )}

          {!loading && (error || activities.length === 0) && (
            <span>
              Unable to load latest activities.{" "}
              <button
                onClick={loadActivities}
                className="text-accent hover:underline focus:underline focus:outline-none"
                disabled={loading}
                aria-label="Retry loading activities"
              >
                Retry
              </button>
            </span>
          )}

          {!loading && !error && activities.length > 0 && (
            <div className="relative">
              {hasMultipleActivities && (
                <motion.span
                  className="text-xs text-muted-foreground mr-2 inline-block"
                  key={`counter-${currentActivityIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  aria-label={`Activity ${currentActivityIndex + 1} of ${activities.length}`}
                >
                  ({currentActivityIndex + 1}/{activities.length})
                </motion.span>
              )}

              <span className="inline-block">
                The latest thing I've done is{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`commit-${currentActivityIndex}`}
                    className="inline-block relative"
                    initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                    transition={{
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.4 }
                    }}
                    onMouseEnter={() => setHoveredCommit(currentActivityIndex)}
                    onMouseLeave={() => setHoveredCommit(null)}
                  >
                    <a
                      href={currentActivity.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-accent transition-colors focus:text-accent focus:outline-none focus:underline"
                      aria-label={`View commit ${currentActivity.latestCommit} on GitHub`}
                    >
                      {currentActivity.latestCommit}
                    </a>

                    <CommitHoverCard
                      activity={currentActivity}
                      isVisible={hoveredCommit === currentActivityIndex}
                      onMouseEnter={() => setHoveredCommit(currentActivityIndex)}
                      onMouseLeave={() => setHoveredCommit(null)}
                    />
                  </motion.span>
                </AnimatePresence>
                {" "}on{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`project-${currentActivityIndex}`}
                    className="inline-block"
                    initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.05,
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.4 }
                    }}
                  >
                    <a
                      href={currentActivity.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline font-medium focus:underline focus:outline-none"
                      aria-label={`View ${currentActivity.project} repository on GitHub`}
                    >
                      {currentActivity.project}
                    </a>
                  </motion.span>
                </AnimatePresence>
                {" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`timestamp-${currentActivityIndex}`}
                    className="text-xs inline-block"
                    initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.1,
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.4 }
                    }}
                  >
                    <time dateTime={currentActivity.timestamp} className="text-muted-foreground">
                      ({currentActivity.timestamp})
                    </time>
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          )}
        </div>
      </div>

      <SpotifyAnimation />
    </section>
  );
}
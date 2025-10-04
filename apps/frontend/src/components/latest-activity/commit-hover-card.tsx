'use client';

import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { GitCommit, Star, GitBranch, Users, Clock, ExternalLink } from "lucide-react";
import { fetchRepositoryData } from "@/services/github-service";
import { getFromCache, setInCache } from "./cache";
import { formatNumber } from "./utils";
import type { TCommitHoverCardProps, TRepositoryData } from "./types";

export const CommitHoverCard = memo(function CommitHoverCard({ 
  activity, 
  isVisible, 
  onMouseEnter, 
  onMouseLeave 
}: TCommitHoverCardProps) {
  const [repoData, setRepoData] = useState<TRepositoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const cacheKey = useMemo(() => activity.repositoryUrl, [activity.repositoryUrl]);

  useEffect(() => {
    if (!isVisible || repoData || loading) return;

    const cached = getFromCache(cacheKey);
    if (cached) {
      setRepoData(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const loadData = async () => {
      try {
        const urlParts = activity.repositoryUrl.split('/');
        const owner = urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];

        const data = await fetchRepositoryData(owner, repo);

        if (cancelled) return;

        if (data) {
          const repoInfo: TRepositoryData = {
            repositoryName: data.title,
            description: data.description || 'No description available',
            stars: data.stars,
            forks: data.forks,
            language: data.language || 'Unknown',
            lastUpdated: data.lastUpdated,
            contributors: data.contributors || 1,
            totalCommits: data.totalCommits || 0,
            repositoryAge: data.repositoryAge || 'Unknown age'
          };
          setRepoData(repoInfo);
          setInCache(cacheKey, repoInfo);
        } else {
          setError(true);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [isVisible, activity.repositoryUrl, repoData, loading, cacheKey]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-0 top-full w-96 max-w-[90vw] isolate"
      style={{ zIndex: 999999 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="tooltip"
      aria-live="polite"
    >
      <div className="h-2 w-full" aria-hidden="true" />

      <div className="bg-card border border-border rounded-xl shadow-2xl p-5 relative backdrop-blur-xl"
        style={{ zIndex: 999999 }}>
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {activity.project}
            </h3>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <GitCommit className="w-4 h-4 mr-2 flex-shrink-0 text-accent" aria-hidden="true" />
              <span className="truncate">{activity.latestCommit}</span>
            </div>
          </div>
          <a
            href={activity.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-all duration-200 ml-3 flex-shrink-0 p-1.5 hover:bg-accent/10 rounded-lg"
            aria-label={`View ${activity.project} repository on GitHub`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        {loading && (
          <div className="animate-pulse space-y-3" aria-label="Loading repository details">
            <div className="h-4 bg-muted/60 rounded-md"></div>
            <div className="h-3 bg-muted/60 rounded-md w-3/4"></div>
            <div className="flex gap-4">
              <div className="h-3 bg-muted/60 rounded-md w-16"></div>
              <div className="h-3 bg-muted/60 rounded-md w-16"></div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Unable to load repository details
            </p>
          </div>
        )}

        {!loading && !error && repoData && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-tight">
              {repoData.description}
            </p>

            <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-muted/40 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.stars)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.forks)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Forks</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <Users className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.contributors)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contributors</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <GitCommit className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.totalCommits)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Commits</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                {repoData.language}
              </span>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {repoData.repositoryAge}
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Latest commit:</span>
                <time className="text-accent font-medium">
                  {activity.timestamp}
                </time>
              </div>
              <a
                href={activity.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-foreground hover:text-accent transition-colors p-2 hover:bg-accent/5 rounded-lg truncate"
                aria-label={`View commit: ${activity.latestCommit}`}
              >
                {activity.latestCommit}
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});
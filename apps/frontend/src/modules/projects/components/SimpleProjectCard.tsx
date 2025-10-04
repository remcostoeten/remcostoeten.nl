'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Star, GitBranch, Calendar, Users, Clock, ExternalLink } from "lucide-react";
import { fetchLatestActivities, LatestActivity as LatestActivityType, fetchRepositoryData } from "@/services/github-service";
import { TSimpleProject } from "../types";
import { SpotifyAnimation } from "@/modules/sections/components/spotify-animation";
type TCommitHoverData = {
  repositoryName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  contributors: number;
  totalCommits: number;
  repositoryAge: string;
};

type TProps = {
  activity: LatestActivityType;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function SimpleProjectCard({ name, url, gitInfo, originLabel }: TSimpleProject) {
  const getOriginLabelStyles = (color?: string) => {
    switch (color) {
      case 'website':
        return 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent border-accent/30 shadow-accent/20';
      case 'community':
        return 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 border-blue-500/30 shadow-blue-500/20';
      case 'personal':
        return 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-600 border-green-500/30 shadow-green-500/20';
      case 'client':
        return 'bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-600 border-purple-500/30 shadow-purple-500/20';
      default:
        return 'bg-gradient-to-r from-muted/20 to-muted/10 text-muted-foreground border-muted/30';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium"
      >
        {name}
      </a>
      {originLabel && (
        <span 
          className={`px-2 py-1 text-xs font-medium border rounded-full shadow-sm ${getOriginLabelStyles(originLabel.color)}`}
          title={originLabel.description}
        >
          {originLabel.icon && <span className="mr-1">{originLabel.icon}</span>}
          {originLabel.text}
        </span>
      )}
    </div>
  );
}

function CommitHoverCard({ activity, isVisible, onMouseEnter, onMouseLeave }: TProps) {
  const [repoData, setRepoData] = useState<TCommitHoverData | null>(null);
  const [loading, setLoading] = useState(false);

  const { owner, repo } = useMemo(() => {
    const urlParts = activity.repositoryUrl.split('/');
    return {
      owner: urlParts[urlParts.length - 2],
      repo: urlParts[urlParts.length - 1]
    };
  }, [activity.repositoryUrl]);

  useEffect(() => {
    if (!isVisible || repoData || loading) return;

    setLoading(true);
    fetchRepositoryData(owner, repo)
      .then(data => {
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
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [isVisible, owner, repo, repoData, loading]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute left-0 top-full z-50 w-80 max-w-[90vw]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-4 w-full -mx-2" />
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base text-foreground">{activity.project}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <GitCommit className="w-3 h-3 inline mr-1" />
              {activity.latestCommit}
            </p>
          </div>
          <a
            href={activity.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4 mb-3"></div>
            <div className="flex gap-4">
              <div className="h-3 bg-muted rounded w-16"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
          </div>
        ) : repoData ? (
          <>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {repoData.description}
            </p>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {repoData.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {repoData.forks}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {repoData.contributors}
                  </span>
                </div>
                <span className="px-2 py-1 bg-muted rounded text-xs">
                  {repoData.language}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3" />
                  {repoData.totalCommits} commits
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {repoData.repositoryAge}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Updated {repoData.lastUpdated}
                </span>
              </div>

              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Latest commit:</span>
                  <span className="text-xs text-accent">{activity.timestamp}</span>
                </div>
                <a
                  href={activity.commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground hover:text-accent transition-colors mt-1 block truncate"
                >
                  {activity.latestCommit}
                </a>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Unable to load repository details
          </p>
        )}
      </div>
    </motion.div>
  );
}

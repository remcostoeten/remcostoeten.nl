'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Star, GitBranch, Calendar, Users, Clock, ExternalLink } from "lucide-react";
import { fetchLatestActivities, LatestActivity as LatestActivityType, fetchRepositoryData } from "@/services/github-service";
import { TSimpleProject, TProjectData } from "../types";
import { OriginLabel } from "./origin-label";
import Link from "next/link";

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

export function SimpleProjectCard(props: TSimpleProject | TProjectData) {
  // Handle both TSimpleProject and TProjectData formats
  const { name, url, gitInfo, originLabel, anchor, title, description, stars, forks, language } = props as any;

  // Normalize the data - use name/title, and create gitInfo if it doesn't exist
  const projectName = name || title;
  const displayName = typeof projectName === 'string' ? projectName.replace(/-/g, ' ') : projectName;
  const normalizedGitInfo = gitInfo || (stars !== undefined ? {
    stars,
    forks: forks || 0,
    language: language || 'Unknown',
    description: description || 'No description available',
    contributors: 1,
    lastCommit: 'recently',
    totalCommits: 0
  } : undefined);
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

  const cardContent = (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap min-w-0 max-w-full">
      <span className="text-accent font-medium min-w-0 truncate max-w-[200px] sm:max-w-[250px]">
        {displayName}
      </span>
      {originLabel && (
        <OriginLabel
          label={originLabel}
          size="sm"
          blogUrl={originLabel.blogUrl}
        />
      )}
    </div>
  );

  if (anchor) {
    return (
      <Link
        href={anchor}
        className="block transition-all duration-200 hover:opacity-80"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap min-w-0 max-w-full">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:text-accent/80 font-medium transition-all duration-200 inline-block min-w-0 truncate max-w-[200px] sm:max-w-[250px]"
      >
        {displayName}
      </Link>
      {originLabel && (
        <OriginLabel
          label={originLabel}
          size="sm"
          blogUrl={originLabel.blogUrl}
        />
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
    if (!isVisible || repoData) return;

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
        } else {
          // If fetchRepositoryData returns null, set error state
          setRepoData({
            repositoryName: activity.project,
            description: 'Unable to load repository details',
            stars: 0,
            forks: 0,
            language: 'Unknown',
            lastUpdated: 'Unknown',
            contributors: 1,
            totalCommits: 0,
            repositoryAge: 'Unknown'
          });
        }
      })
      .catch((error) => {
        console.error('Failed to fetch repository data:', error);
        // Set a fallback state so the skeleton doesn't show forever
        setRepoData({
          repositoryName: activity.project,
          description: 'Unable to load repository details',
          stars: 0,
          forks: 0,
          language: 'Unknown',
          lastUpdated: 'Unknown',
          contributors: 1,
          totalCommits: 0,
          repositoryAge: 'Unknown'
        });
      })
      .finally(() => setLoading(false));
  }, [isVisible, owner, repo, activity.project]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute left-0 top-full z-50 w-80 max-w-[90vw]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-4 w-full -mx-2" />
      <div className="bg-gradient-to-br from-card via-card/98 to-card/95 border border-border/80 rounded-lg shadow-2xl shadow-accent/5 backdrop-blur-sm p-4">
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
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  GitCommit, Star, GitBranch, Users, Clock, Calendar, ExternalLink,
  Package, Download, Code2
} from "lucide-react";
import { fetchRepositoryData } from "@/services/github-service";
import { fetchNpmPackageData } from "@/services/npm-service";
import { TSimpleProject } from "../types";

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
  license?: string;
};

type TNpmData = {
  name: string;
  description: string;
  version: string;
  weeklyDownloads: number;
  totalDownloads: number;
  lastPublish: string;
  dependencies: number;
  size?: string;
};

type TProjectHoverCardProps = {
  project: TSimpleProject;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export const ProjectHoverCard = memo(function ProjectHoverCard({
  project,
  isVisible,
  onMouseEnter,
  onMouseLeave
}: TProjectHoverCardProps) {
  const [repoData, setRepoData] = useState<TRepositoryData | null>(null);
  const [npmData, setNpmData] = useState<TNpmData | null>(null);
  const [loading, setLoading] = useState(false);
  const [npmLoading, setNpmLoading] = useState(false);
  const [error, setError] = useState(false);

  const { owner, repo } = useMemo(() => {
    if (!project.url) return { owner: '', repo: '' };
    const urlParts = project.url.split('/');
    return {
      owner: urlParts[urlParts.length - 2],
      repo: urlParts[urlParts.length - 1]
    };
  }, [project.url]);

  const packageName = useMemo(() => {
    if (project.packageInfo?.isPackage && project.packageInfo.npmUrl) {
      const urlParts = project.packageInfo.npmUrl.split('/');
      return urlParts[urlParts.length - 1];
    }
    return repo;
  }, [project.packageInfo, repo]);

  useEffect(() => {
    if (!isVisible || !owner || !repo || repoData) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    const loadRepoData = async () => {
      try {
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
            repositoryAge: data.repositoryAge || 'Unknown age',
            license: data.license
          };
          setRepoData(repoInfo);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Failed to fetch repository data:', error);
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRepoData();

    return () => {
      cancelled = true;
    };
  }, [isVisible, owner, repo, repoData]);

  useEffect(() => {
    if (!isVisible || !packageName || npmData || !project.packageInfo?.isPackage) return;

    let cancelled = false;
    setNpmLoading(true);

    const loadNpmData = async () => {
      try {
        const data = await fetchNpmPackageData(packageName);

        if (cancelled) return;

        if (data) {
          const packageInfo: TNpmData = {
            name: data.name,
            description: data.description || 'No description available',
            version: data.version || '0.0.0',
            weeklyDownloads: data.weeklyDownloads || 0,
            totalDownloads: data.totalDownloads || 0,
            lastPublish: data.lastPublish || 'Unknown',
            dependencies: data.dependencies || 0,
            size: data.size
          };
          setNpmData(packageInfo);
        }
      } catch (error) {
        console.error('Failed to fetch npm data:', error);
      } finally {
        if (!cancelled) {
          setNpmLoading(false);
        }
      }
    };

    loadNpmData();

    return () => {
      cancelled = true;
    };
  }, [isVisible, packageName, npmData, project.packageInfo?.isPackage]);

  if (!isVisible) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-0 top-full w-[32rem] max-w-[95vw] isolate z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="tooltip"
      aria-live="polite"
    >
      <div className="h-2 w-full" aria-hidden="true" />

      <div className="bg-card border border-border rounded-xl shadow-2xl p-6 relative backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {project.name.replace(/-/g, ' ')}
              </h3>
              {project.packageInfo?.isPackage && (
                <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-600 border border-red-500/30 rounded-full text-xs font-medium">
                  <Package className="w-3 h-3 mr-1" />
                  Package
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Code2 className="w-4 h-4 mr-2 flex-shrink-0 text-accent" />
              <span className="truncate">{owner}/{repo}</span>
            </div>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-all duration-200 ml-3 flex-shrink-0 p-1.5 hover:bg-accent/10 rounded-lg"
            aria-label={`View ${project.name} repository on GitHub`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="animate-pulse space-y-4" aria-label="Loading repository details">
            <div className="h-4 bg-muted/60 rounded-md"></div>
            <div className="h-3 bg-muted/60 rounded-md w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-3 bg-muted/60 rounded-md w-20"></div>
              <div className="h-3 bg-muted/60 rounded-md w-20"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Unable to load repository details
            </p>
          </div>
        )}

        {/* Repository Data */}
        {!loading && !error && repoData && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground leading-tight">
              {repoData.description}
            </p>

            {/* GitHub Stats */}
            <div className="grid grid-cols-2 gap-5 py-4 px-5 bg-muted/40 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="w-3.5 h-3.5" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.stars)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.forks)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Forks</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.contributors)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contributors</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent">
                    <GitCommit className="w-3.5 h-3.5" />
                    <span className="font-semibold text-sm">{formatNumber(repoData.totalCommits)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Commits</p>
                </div>
              </div>
            </div>

            {/* NPM Package Data */}
            {project.packageInfo?.isPackage && (
              <div className="border-t border-border/60 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-red-500" />
                  <h4 className="font-medium text-sm text-foreground">Package Information</h4>
                </div>

                {npmLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-muted/60 rounded-md w-3/4"></div>
                    <div className="h-3 bg-muted/60 rounded-md w-1/2"></div>
                  </div>
                ) : npmData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-red-600">
                            <Download className="w-3.5 h-3.5" />
                            <span className="font-semibold text-sm">{formatNumber(npmData.weeklyDownloads)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Weekly</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-red-600">
                            <Download className="w-3.5 h-3.5 opacity-60" />
                            <span className="font-semibold text-sm">{formatNumber(npmData.totalDownloads)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-red-600">v{npmData.version}</span>
                          <p className="text-xs text-muted-foreground">Version</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{npmData.dependencies}</span>
                          <p className="text-xs text-muted-foreground">Deps</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last publish:</span>
                      <span className="text-red-600 font-medium">
                        {npmData.lastPublish}
                      </span>
                    </div>

                    <a
                      href={project.packageInfo.npmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Package className="w-3 h-3" />
                      View on npm
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Package information unavailable
                  </p>
                )}
              </div>
            )}

            {/* Repository Info Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {repoData.language}
                </span>
                {repoData.license && (
                  <span className="text-xs text-muted-foreground">
                    {repoData.license}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {repoData.lastUpdated}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { GitHub } from "@remcostoeten/fync-github"; // Temporarily disabled due to build issues
import { formatTimeAgo } from "@/lib/utils";
import { TextSkeleton } from "./ui/text-skeleton";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

type TGitHubUser = {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string;
  blog: string;
  location: string;
  company: string;
  created_at: string;
};

type TGitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  created_at: string;
  topics: string[];
  size: number;
};

type TGitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  repository?: {
    name: string;
    full_name: string;
  };
};

type TActivityState = {
  user: TGitHubUser | null;
  repos: TGitHubRepo[];
  commits: TGitHubCommit[];
  loading: boolean;
  error: string | null;
};

export function FyncGithubDemo() {
  const [state, setState] = useState<TActivityState>({
    user: null,
    repos: [],
    commits: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch user data directly from GitHub API
        const userResponse = await fetch('https://api.github.com/users/remcostoeten', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'remcostoeten.nl-demo'
          }
        });
        const user = await userResponse.json();
        
        // Fetch repositories (sorted by updated)
        const reposResponse = await fetch('https://api.github.com/users/remcostoeten/repos?sort=updated&per_page=6', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'remcostoeten.nl-demo'
          }
        });
        const repos = await reposResponse.json();
        
        // Fetch recent commits from the main repositories
        const commitPromises = repos.slice(0, 3).map(async (repo: TGitHubRepo) => {
          try {
            const commitsResponse = await fetch(`https://api.github.com/repos/remcostoeten/${repo.name}/commits?per_page=3`, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'remcostoeten.nl-demo'
              }
            });
            const repoCommits = await commitsResponse.json();
            return repoCommits.map((commit: TGitHubCommit) => ({
              ...commit,
              repository: {
                name: repo.name,
                full_name: repo.full_name
              }
            }));
          } catch (error) {
            console.warn(`Failed to fetch commits for ${repo.name}:`, error);
            return [];
          }
        });
        
        const commitResults = await Promise.all(commitPromises);
        const allCommits = commitResults.flat().slice(0, 10);
        
        setState({
          user,
          repos,
          commits: allCommits,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Failed to fetch GitHub data:", error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch GitHub data"
        }));
      }
    }

    fetchGitHubData();
  }, []);

  if (state.error) {
    return (
      <Card className="p-6">
        <div className="text-destructive">
          Error loading GitHub data: {state.error}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">GitHub Activity Demo</h2>
        <p className="text-muted-foreground">
          This will be powered by{" "}
          <a 
            href="https://www.npmjs.com/package/@remcostoeten/fync-github" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            @remcostoeten/fync-github
          </a>
          {" "}(currently using GitHub API directly while fixing package builds)
        </p>
      </div>

      {/* User Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {state.loading ? (
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
          ) : (
            <img 
              src={state.user?.avatar_url} 
              alt={state.user?.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div className="space-y-1">
            {state.loading ? (
              <>
                <TextSkeleton width="120px" height="1.5rem" />
                <TextSkeleton width="200px" height="1rem" />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{state.user?.name}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{state.user?.public_repos} repos</span>
                  <span>{state.user?.followers} followers</span>
                  <span>{state.user?.following} following</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Recent Commits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Commits</h3>
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {state.loading ? (
              <motion.div
                key="commits-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                    <div className="flex-1 space-y-2">
                      <TextSkeleton width="300px" height="1rem" />
                      <TextSkeleton width="150px" height="0.875rem" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="commits-loaded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {state.commits.map((commit) => (
                  <motion.div
                    key={commit.sha}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {commit.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{commit.repository?.name}</span>
                        <span>•</span>
                        <a 
                          href={commit.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono hover:text-accent"
                        >
                          {commit.sha.substring(0, 7)}
                        </a>
                        <span>•</span>
                        <span>{formatTimeAgo(new Date(commit.commit.author.date))}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Recent Repositories */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Repositories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {state.loading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <TextSkeleton width="150px" height="1.25rem" />
                    <TextSkeleton width="100%" height="2.5rem" />
                    <div className="flex gap-2">
                      <TextSkeleton width="60px" height="1.5rem" className="rounded-full" />
                      <TextSkeleton width="40px" height="1.5rem" className="rounded-full" />
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <>
                {state.repos.map((repo) => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors space-y-3 block"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold truncate">{repo.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {repo.stargazers_count > 0 && (
                          <span>⭐ {repo.stargazers_count}</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {repo.description || "No description available"}
                    </p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Updated {formatTimeAgo(new Date(repo.updated_at))}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

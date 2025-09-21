'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Star, GitBranch, Calendar, Users, Clock, ExternalLink } from "lucide-react";
import { fetchLatestActivities, LatestActivity as LatestActivityType, fetchRepositoryData } from "@/services/githubService";
import { SpotifyAnimation } from "./SpotifyAnimation";

interface CommitHoverData {
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

const CommitHoverCard = ({ activity, isVisible, onMouseEnter, onMouseLeave }: {
  activity: LatestActivityType;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const [repoData, setRepoData] = useState<CommitHoverData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && !repoData && !loading) {
      setLoading(true);
      // Extract owner and repo from repository URL
      const urlParts = activity.repositoryUrl.split('/');
      const owner = urlParts[urlParts.length - 2];
      const repo = urlParts[urlParts.length - 1];
      
      fetchRepositoryData(owner, repo).then(data => {
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
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [isVisible, activity.repositoryUrl, repoData, loading]);

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
        >
          {/* Invisible bridge to prevent hover loss */}
          <div className="h-4 w-full -mx-2" />

          {/* Actual card content */}
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
                  {/* First row: Stars, forks, and language */}
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

                  {/* Second row: Additional stats */}
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

                  {/* Third row: Commit info */}
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
      )}
    </AnimatePresence>
  );
};

export const LatestActivity = () => {
  const [activities, setActivities] = useState<LatestActivityType[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCommit, setHoveredCommit] = useState<number | null>(null);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading latest 5 GitHub activities...');
      const result = await fetchLatestActivities();
      setActivities(result.activities);
      console.log('✅ Latest activities loaded:', result.activities.length, 'activities');
    } catch (err) {
      console.error('❌ Failed to load latest activities:', err);
      setError('Failed to load latest activities');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on first render
  useEffect(() => {
    loadActivities();
  }, []);

  // Cycle through activities every 4 seconds
  useEffect(() => {
    if (activities.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <div className="text-body-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-start gap-2 mb-2">
        <GitCommit className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <span className="leading-relaxed">
          {loading ? (
            <span className="animate-pulse">Loading latest activities...</span>
          ) : error || activities.length === 0 ? (
            <span>
              Unable to load latest activities.{" "}
              <button
                onClick={loadActivities}
                className="text-accent hover:underline"
                disabled={loading}
              >
                Retry
              </button>
            </span>
          ) : (
            <div className="relative">
              {activities.length > 1 && (
                <motion.span 
                  className="text-xs text-muted-foreground mr-2 inline-block"
                  key={`counter-${currentActivityIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
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
                      href={activities[currentActivityIndex].commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-accent transition-colors"
                      title="View commit on GitHub"
                    >
                      {activities[currentActivityIndex].latestCommit}
                    </a>
                    
                    <CommitHoverCard
                      activity={activities[currentActivityIndex]}
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
                      href={activities[currentActivityIndex].repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline font-medium"
                    >
                      {activities[currentActivityIndex].project}
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
                    ({activities[currentActivityIndex].timestamp})
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          )}
        </span>
      </div>

      <SpotifyAnimation />
    </div>
  );
};
'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Star, GitBranch, Calendar, Users, Clock, ExternalLink, Music, Play, Pause } from "lucide-react";
import { fetchLatestActivities, LatestActivity as TLatestActivity, fetchRepositoryData } from "@/services/github-service";
import { getCurrentOrRecentMusic, SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service";

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

type TSpotifyData = {
  track: SpotifyTrack | SpotifyRecentTrack | null;
  loading: boolean;
  error: string | null;
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
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-full z-50 w-96 max-w-[90vw]"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          role="tooltip"
          aria-live="polite"
        >
          <div className="h-2 w-full" aria-hidden="true" />

          <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl p-5 ring-1 ring-black/5">
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
                <p className="text-sm text-muted-foreground leading-relaxed">
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
                    <time className="text-accent font-medium" dateTime={activity.timestamp}>
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
      )}
    </AnimatePresence>
  );
}

function RealSpotifyIntegration() {
  const [spotifyData, setSpotifyData] = useState<TSpotifyData>({
    track: null,
    loading: true,
    error: null
  });

  const loadSpotifyData = useCallback(async () => {
    try {
      setSpotifyData(prev => ({ ...prev, loading: true, error: null }));
      const track = await getCurrentOrRecentMusic();
      setSpotifyData({
        track,
        loading: false,
        error: track ? null : 'No music data available'
      });
    } catch (error) {
      console.error('Failed to load Spotify data:', error);
      setSpotifyData({
        track: null,
        loading: false,
        error: 'Failed to load music data'
      });
    }
  }, []);

  useEffect(() => {
    loadSpotifyData();
    // Refresh every 30 seconds
    const interval = setInterval(loadSpotifyData, 30000);
    return () => clearInterval(interval);
  }, [loadSpotifyData]);

  const { track, loading, error } = spotifyData;

  if (loading) {
    return (
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
        <div className="p-1.5 bg-green-500/10 rounded-lg">
          <Music className="w-4 h-4 text-green-500 animate-pulse" />
        </div>
        <div className="text-sm text-muted-foreground">
          Loading music data...
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
        <div className="p-1.5 bg-muted/50 rounded-lg">
          <Music className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-sm text-muted-foreground">
          No music playing right now
        </div>
      </div>
    );
  }

  const isCurrentlyPlaying = 'is_playing' in track && track.is_playing;
  const isRecentTrack = 'played_at' in track;

  return (
    <motion.div 
      className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-1.5 bg-green-500/10 rounded-lg">
        {isCurrentlyPlaying ? (
          <Play className="w-4 h-4 text-green-500" />
        ) : (
          <Music className="w-4 h-4 text-green-500" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground">
          {isCurrentlyPlaying ? 'Currently listening to' : 'Recently played'}{" "}
          <a
            href={track.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-accent transition-colors"
            title={`Listen to ${track.name} on Spotify`}
          >
            {track.name}
          </a>
          {" "}by{" "}
          <span className="font-medium text-foreground">
            {track.artist}
          </span>
          {isRecentTrack && (
            <span className="text-xs ml-2 text-muted-foreground">
              ({new Date(track.played_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })})
            </span>
          )}
        </div>
        
        {track.album && (
          <div className="text-xs text-muted-foreground mt-1">
            from <span className="italic">{track.album}</span>
          </div>
        )}
      </div>

      {track.image_url && (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
          <img
            src={track.image_url}
            alt={`${track.album} album cover`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </motion.div>
  );
}

export function LatestActivityRedesign() {
  const [activities, setActivities] = useState<TLatestActivity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCommit, setHoveredCommit] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [projectStats, setProjectStats] = useState<{
    totalProjects: number;
    totalStars: number;
    totalCommits: number;
    loading: boolean;
  }>({
    totalProjects: 0,
    totalStars: 0,
    totalCommits: 0,
    loading: true
  });

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchLatestActivities();
      setActivities(result.activities);
      
      // Calculate project statistics
      setProjectStats(prev => ({ ...prev, loading: true }));
      
      let totalStars = 0;
      let totalCommits = 0;
      const uniqueProjects = new Set();
      
      // Fetch repository data for each unique project
      const projectPromises = result.activities.map(async (activity) => {
        uniqueProjects.add(activity.project);
        try {
          const urlParts = activity.repositoryUrl.split('/');
          const owner = urlParts[urlParts.length - 2];
          const repo = urlParts[urlParts.length - 1];
          
          const repoData = await fetchRepositoryData(owner, repo);
          if (repoData) {
            totalStars += repoData.stars || 0;
            totalCommits += repoData.totalCommits || 0;
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${activity.project}:`, error);
        }
      });
      
      await Promise.allSettled(projectPromises);
      
      setProjectStats({
        totalProjects: uniqueProjects.size,
        totalStars,
        totalCommits,
        loading: false
      });
      
    } catch (err) {
      console.error('Failed to load latest activities:', err);
      setError('Failed to load latest activities');
      setProjectStats(prev => ({ ...prev, loading: false }));
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
    <motion.div 
      className="mt-6 p-4 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-labelledby="latest-activity-heading"
    >
      <h2 id="latest-activity-heading" className="sr-only">Latest Development Activity</h2>

      <div className="flex items-start gap-3 mb-3">
        <div className="p-1.5 bg-accent/10 rounded-lg">
          <GitCommit className="w-4 h-4 text-accent" aria-hidden="true" />
        </div>

        <div className="leading-relaxed min-w-0 flex-1 text-sm" role="status" aria-live="polite">
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Loading latest activities...</span>
            </div>
          )}

          {!loading && (error || activities.length === 0) && (
            <div className="text-muted-foreground">
              Unable to load latest activities.{" "}
              <button
                onClick={loadActivities}
                className="text-accent hover:underline focus:underline focus:outline-none transition-colors"
                disabled={loading}
                aria-label="Retry loading activities"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && activities.length > 0 && (
            <div className="relative">
              {hasMultipleActivities && (
                <motion.div
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium mb-2"
                  key={`counter-${currentActivityIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  aria-label={`Activity ${currentActivityIndex + 1} of ${activities.length}`}
                >
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                  {currentActivityIndex + 1} of {activities.length}
                </motion.div>
              )}

              <div className="text-muted-foreground">
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
                      className="font-semibold text-foreground hover:text-accent transition-colors focus:text-accent focus:outline-none focus:underline px-1 py-0.5 rounded hover:bg-accent/5"
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
                      className="text-accent hover:underline font-semibold focus:underline focus:outline-none px-1 py-0.5 rounded hover:bg-accent/5 transition-colors"
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
                    className="inline-block"
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
                    <time dateTime={currentActivity.timestamp} className="text-xs text-muted-foreground font-medium">
                      ({currentActivity.timestamp})
                    </time>
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Statistics */}
      {!loading && !error && activities.length > 0 && (
        <motion.div 
          className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span>
                {projectStats.loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${projectStats.totalProjects} projects`
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>
                {projectStats.loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${formatNumber(projectStats.totalStars)} stars`
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" />
              <span>
                {projectStats.loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${formatNumber(projectStats.totalCommits)} commits`
                )}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <RealSpotifyIntegration />
    </motion.div>
  );
}

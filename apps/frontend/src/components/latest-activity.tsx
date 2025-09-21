'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Star, GitBranch, Users, Clock, ExternalLink, Music, Play } from "lucide-react";
import { fetchLatestActivities, LatestActivity as TLatestActivity, fetchRepositoryData } from "@/services/github-service";
import { getCurrentOrRecentMusic, getRecentMusicTracks, SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service";
import { LatestActivitySkeleton } from "./latest-activity-skeleton";

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
  tracks: (SpotifyTrack | SpotifyRecentTrack)[];
  currentTrack: SpotifyTrack | SpotifyRecentTrack | null;
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

function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
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
          className="absolute left-0 top-full z-[9999] w-96 max-w-[90vw]"
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
      )}
    </AnimatePresence>
  );
}

function RealSpotifyIntegration() {
  const [spotifyData, setSpotifyData] = useState<TSpotifyData>({
    tracks: [],
    currentTrack: null,
    loading: true,
    error: null
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const loadSpotifyData = useCallback(async () => {
    try {
      setSpotifyData(prev => ({ ...prev, loading: true, error: null }));
      
      // First try to get currently playing track
      const currentTrack = await getCurrentOrRecentMusic();
      
      // Then get recent tracks for rotation
      const recentTracks = await getRecentMusicTracks(5);
      
      let allTracks: (SpotifyTrack | SpotifyRecentTrack)[] = [];
      
      // If we have a currently playing track, add it first
      if (currentTrack && 'is_playing' in currentTrack && currentTrack.is_playing) {
        allTracks.push(currentTrack);
      }
      
      // Add recent tracks, avoiding duplicates
      recentTracks.forEach(track => {
        const isDuplicate = allTracks.some(existing => 
          existing.name === track.name && existing.artist === track.artist
        );
        if (!isDuplicate) {
          allTracks.push(track);
        }
      });
      
      // If no tracks at all, try to get at least one
      if (allTracks.length === 0 && currentTrack) {
        allTracks.push(currentTrack);
      }
      
      setSpotifyData({
        tracks: allTracks,
        currentTrack: allTracks[0] || null,
        loading: false,
        error: allTracks.length === 0 ? 'No music data available' : null
      });
      
      setCurrentTrackIndex(0);
    } catch (error) {
      console.error('Failed to load Spotify data:', error);
      setSpotifyData({
        tracks: [],
        currentTrack: null,
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

  // Cycle through tracks
  useEffect(() => {
    if (spotifyData.tracks.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentTrackIndex((prev) => {
        const nextIndex = (prev + 1) % spotifyData.tracks.length;
        setSpotifyData(prevData => ({
          ...prevData,
          currentTrack: prevData.tracks[nextIndex]
        }));
        return nextIndex;
      });
    }, 4000); // Same timing as commits

    return () => clearInterval(interval);
  }, [spotifyData.tracks.length, isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const { currentTrack, loading, error } = spotifyData;

  if (loading) {
    return (
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
        <div className="p-1.5 bg-green-500/10 rounded-lg">
          <Music className="w-4 h-4 text-green-500 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground leading-tight">
            <div className="h-4 bg-muted/60 rounded-md w-64 animate-pulse"></div>
          </div>
          <div className="text-xs text-muted-foreground leading-tight mt-1">
            <div className="h-3 bg-muted/40 rounded-md w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"></div>
      </div>
    );
  }

  if (error || !currentTrack) {
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

  const isCurrentlyPlaying = 'is_playing' in currentTrack && currentTrack.is_playing;
  const isRecentTrack = 'played_at' in currentTrack;

  return (
    <div 
      className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-1.5 bg-green-500/10 rounded-lg">
        {isCurrentlyPlaying ? (
          <Play className="w-4 h-4 text-green-500" />
        ) : (
          <Music className="w-4 h-4 text-green-500" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground leading-tight">
          {isCurrentlyPlaying ? 'Currently listening to' : 'Recently played'}{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={`track-${currentTrackIndex}`}
              className="inline-block"
              initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                filter: { duration: 0.4 }
              }}
            >
              <a
                href={currentTrack.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-accent transition-colors px-1 py-0.5 rounded hover:bg-accent/5"
                title={`Listen to ${currentTrack.name} on Spotify`}
              >
                {currentTrack.name}
              </a>
            </motion.span>
          </AnimatePresence>
          {" "}by{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={`artist-${currentTrackIndex}`}
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
              <span className="font-medium text-foreground" title={currentTrack.artist}>
                {currentTrack.artist}
              </span>
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="text-xs text-muted-foreground leading-tight mt-1">
          {currentTrack.album && (
            <AnimatePresence mode="wait">
              <motion.span
                key={`album-${currentTrackIndex}`}
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
                from <span className="italic truncate max-w-[200px] inline-block align-bottom" title={currentTrack.album}>{currentTrack.album}</span>
              </motion.span>
            </AnimatePresence>
          )}
          {!currentTrack.album && <span>&nbsp;</span>}
          {isRecentTrack && (
            <AnimatePresence mode="wait">
              <motion.span
                key={`timestamp-${currentTrackIndex}`}
                className="inline-block ml-2"
                initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.15,
                  ease: [0.16, 1, 0.3, 1],
                  filter: { duration: 0.4 }
                }}
              >
                ({formatTimestamp(currentTrack.played_at)})
              </motion.span>
            </AnimatePresence>
          )}
        </div>
      </div>

      {currentTrack.image_url && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`image-${currentTrackIndex}`}
            className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(2px)" }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
              filter: { duration: 0.3 }
            }}
          >
            <img
              src={currentTrack.image_url}
              alt={`${currentTrack.album} album cover`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export function LatestActivity() {
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

  // Show skeleton while initial loading
  if (loading) {
    return <LatestActivitySkeleton />;
  }

  return (
    <div 
      className="mt-6 p-4 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm"
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
          {(error || activities.length === 0) && (
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

          {!error && activities.length > 0 && (
            <div className="relative">


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
                    <time className="text-xs text-muted-foreground font-medium">
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
      {!error && activities.length > 0 && (
        <div 
          className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30"
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
        </div>
      )}

      <RealSpotifyIntegration />
    </div>
  );
}

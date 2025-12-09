'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion as motionOriginal, AnimatePresence } from 'framer-motion';
import { Music, GitBranch, Calendar, Activity } from 'lucide-react';
import { useRecentCommits } from '@/hooks/use-github';
import { getLatestTracks, SpotifyTrack } from '@/core/spotify-service';
import { ActivityContributionGraph } from './activity-contribution-graph';
import { Section, TimelineItem } from './ui/section';

const motion = motionOriginal as any;

const SPRING_EASE = [0.32, 0.72, 0, 1];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.02 }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 }
  }
};

const itemVariants = {
  initial: { y: 8, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: SPRING_EASE }
  },
  exit: {
    y: -6,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const Equalizer = () => (
  <div className="flex items-end gap-[1px] h-3" aria-hidden="true">
    <div className="w-[2px] bg-green-500 rounded-full animate-[music-bar_0.8s_ease-in-out_infinite]" />
    <div className="w-[2px] bg-green-500 rounded-full animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]" />
    <div className="w-[2px] bg-green-500 rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]" />
  </div>
);

const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ActivitySection = () => {
  const year = new Date().getFullYear();
  const [songIndex, setSongIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [spotifyLoading, setSpotifyLoading] = useState(true);

  const { data: commitsData, isLoading: githubLoading } = useRecentCommits(5);
  const commits = commitsData?.commits || [];
  const loading = spotifyLoading || githubLoading;

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        const spotifyTracks = await getLatestTracks();
        setTracks(spotifyTracks);
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
      } finally {
        setSpotifyLoading(false);
      }
    };
    fetchSpotifyData();
  }, []);

  useEffect(() => {
    if (tracks.length === 0) return;
    const interval = setInterval(() => {
      setSongIndex((prev) => (prev + 1) % tracks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tracks.length]);

  useEffect(() => {
    if (commits.length === 0) return;
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % commits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [commits.length]);

  const currentTrack = tracks[songIndex] || { name: 'Loading...', artist: '...', url: '#', played_at: new Date().toISOString() };
  const currentCommit = commits[activityIndex] || {
    message: 'Loading...',
    url: '#',
    projectName: '...',
    date: new Date().toISOString()
  };

  return (
    <Section
      title="Activity & Contributions"
      icon={Activity}
      headerAction={<span className="text-muted-foreground/60">{year}</span>}
    >
      <div className="space-y-4">
        {/* Contribution Graph */}
        <div className="rounded-lg border border-border/30 bg-background/50 p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Contribution Graph</span>
          </div>
          <ActivityContributionGraph year={year} showLegend={true} />
        </div>

        {/* Activity Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Latest Commit */}
          <div className="rounded-lg border border-border/30 bg-background/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex size-5 items-center justify-center rounded bg-muted/80">
                <GitBranch className="size-3 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Latest Commit</span>
            </div>

            <AnimatePresence mode='wait'>
              <motion.div
                key={activityIndex}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="pl-7 space-y-0.5"
              >
                <motion.a
                  href={currentCommit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate"
                  variants={itemVariants}
                >
                  {(currentCommit as any).projectName}
                </motion.a>
                <motion.p
                  className="text-xs text-muted-foreground truncate"
                  variants={itemVariants}
                >
                  {currentCommit.message.split('\n')[0]}
                </motion.p>
                <motion.span
                  className="text-[10px] text-muted-foreground/60"
                  variants={itemVariants}
                >
                  {formatRelativeTime(currentCommit.date)}
                </motion.span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Currently Playing */}
          <div className="rounded-lg border border-border/30 bg-background/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded bg-green-500/10">
                  <Music className="size-3 text-green-500" />
                </div>
                <span className="text-xs font-medium text-foreground">Currently Playing</span>
              </div>
              <Equalizer />
            </div>

            <AnimatePresence mode='wait'>
              <motion.div
                key={songIndex}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="pl-7 space-y-0.5"
              >
                <motion.a
                  href={currentTrack.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate"
                  variants={itemVariants}
                >
                  {currentTrack.name}
                </motion.a>
                <motion.p
                  className="text-xs text-muted-foreground truncate"
                  variants={itemVariants}
                >
                  {currentTrack.artist}
                </motion.p>
                <motion.span
                  className="text-[10px] text-muted-foreground/60"
                  variants={itemVariants}
                >
                  {formatRelativeTime(currentTrack.played_at)}
                </motion.span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
};

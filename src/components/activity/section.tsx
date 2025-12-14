'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Calendar } from 'lucide-react';
import { getLatestTracks, getNowPlaying, SpotifyTrack, NowPlaying, formatDuration } from '@/core/spotify-service';
import { AnimatedNumber } from '../ui/animated-number';
import { ActivityContributionGraph } from './contribution-graph';
import { Section } from '../ui/section';
import { GitHubActivityCard } from './github-card';

const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    }
  }
};

const itemVariants = {
  initial: {
    y: 12,
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ...SPRING_CONFIG,
      opacity: { duration: 0.4, ease: SMOOTH_EASE },
      filter: { duration: 0.3 },
    }
  },
  exit: {
    y: -8,
    opacity: 0,
    scale: 0.98,
    filter: "blur(2px)",
    transition: {
      duration: 0.25,
      ease: SMOOTH_EASE,
    }
  }
};

const wrapperVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: SMOOTH_EASE,
    }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.3,
      ease: SMOOTH_EASE,
    }
  }
};

function Equalizer() {
  return (
    <div className='flex items-end gap-[1px] h-3' aria-hidden='true'>
      <div className='w-[2px] bg-green-500 rounded-full animate-[music-bar_0.8s_ease-in-out_infinite]' />
      <div className='w-[2px] bg-green-500 rounded-full animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]' />
      <div className='w-[2px] bg-green-500 rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]' />
    </div>
  )
}

type RelativeTime = {
  number: number | null
  suffix: string
  isSpecial: boolean
}

function formatRelativeTime(dateString: string): RelativeTime {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return { number: null, suffix: 'just now', isSpecial: true };
  if (diffMins < 60) return { number: diffMins, suffix: 'm ago', isSpecial: false };
  if (diffHours < 24) return { number: diffHours, suffix: 'h ago', isSpecial: false };
  if (diffDays === 1) return { number: null, suffix: 'yesterday', isSpecial: true };
  if (diffDays < 7) return { number: diffDays, suffix: 'd ago', isSpecial: false };
  return { number: null, suffix: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isSpecial: true };
};

export function ActivitySection() {
  const year = new Date().getFullYear();
  const [songIndex, setSongIndex] = useState(0);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll for currently playing track
  useEffect(() => {
    const checkNowPlaying = async () => {
      const data = await getNowPlaying();
      setNowPlaying(data);
    };

    checkNowPlaying();
    const interval = setInterval(checkNowPlaying, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch recent tracks history (fallback)
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const spotifyTracks = await getLatestTracks();
        setTracks(spotifyTracks);
      } catch (error) {
        console.error('Error fetching recent tracks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  // Rotate tracks (always rotate, nowPlaying simply injects itself)
  useEffect(() => {
    if (tracks.length === 0) return;
    const interval = setInterval(() => {
      setSongIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [tracks.length]);

  // Determine what to show
  const isRealTimePlaying = nowPlaying?.isPlaying && nowPlaying?.track;

  // Show "Currently Playing" every 5th rotation if active (approx 20% of the time)
  // Otherwise show the recent track at the current index
  const shouldShowNowPlaying = isRealTimePlaying && (songIndex > 0 && songIndex % 5 === 0);

  const currentTrack = shouldShowNowPlaying
    ? nowPlaying!.track!
    : (tracks[songIndex % tracks.length] || { name: 'Loading...', artist: '...', url: '#', played_at: new Date().toISOString() });

  const label = shouldShowNowPlaying ? 'Currently Playing' : 'Recently Played';
  const showProgressBar = shouldShowNowPlaying;

  // Calculate progress percentage for bar
  const progressPercent = nowPlaying ? Math.min(100, (nowPlaying.progress_ms / nowPlaying.duration_ms) * 100) : 0;

  return (
    <Section
      title="Activity & Contributions"
      headerAction={
        <span className="text-muted-foreground/60 inline-flex items-baseline">
          <span className="-translate-y-[1px]">
            <AnimatedNumber value={year} duration={800} />
          </span>
        </span>
      }
    >
      <div className="space-y-4">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Contribution Graph</span>
          </div>
          <ActivityContributionGraph year={year} showLegend={true} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 -m-1">
          <GitHubActivityCard />

          <div className="rounded-lg border border-border/30 bg-background/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`flex size-5 items-center justify-center rounded ${showProgressBar ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                  <Music className={`size-3 ${showProgressBar ? 'text-green-500' : 'text-orange-500'}`} />
                </div>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </div>
              {showProgressBar && <Equalizer />}
            </div>

            <AnimatePresence mode='wait'>
              <motion.div
                key={shouldShowNowPlaying ? 'now-playing' : `recent-${songIndex}`}
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

                <motion.div variants={itemVariants} className="pt-1">
                  {showProgressBar ? (
                    <div className="space-y-1">
                      {/* Progress Bar */}
                      <div className="h-1 w-full bg-border/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-green-500 rounded-full"
                          initial={{ width: `${progressPercent}%` }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </div>

                      {/* Time Stamps */}
                      <div className="flex justify-between text-[10px] text-muted-foreground/60 tabular-nums">
                        <span>{formatDuration(nowPlaying.progress_ms)}</span>
                        <span>{formatDuration(nowPlaying.duration_ms)}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 inline-flex items-baseline">
                      {(() => {
                        const time = formatRelativeTime(currentTrack.played_at);
                        if (time.isSpecial) return time.suffix;
                        return (
                          <>
                            <span className="-translate-y-[1px]">
                              <AnimatedNumber key={`time-${songIndex}`} value={time.number!} duration={800} delay={250} />
                            </span>
                            {time.suffix}
                          </>
                        );
                      })()}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
};

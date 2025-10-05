'use client';

import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play } from "lucide-react";
import { getCurrentOrRecentMusic, getRecentMusicTracks, type SpotifyTrack, type SpotifyRecentTrack } from "@/services/spotify-service";
import { formatTimestamp } from "./utils";
import { SpotifyHoverCard } from "./spotify-hover-card";
import { AnimatedTimestamp } from "../../shared/components/animated-numbers";
import type { TSpotifyData } from "./types";

export const SpotifyIntegration = memo(function SpotifyIntegration() {
  const STAGGER_DURATION = 0.6;
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const DELAY_STEP = 0.03;

  function buildTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: order * DELAY_STEP,
      ease: STAGGER_EASE,
      filter: { duration: 0.3 }
    };
  }

  const [spotifyData, setSpotifyData] = useState<TSpotifyData>({
    tracks: [],
    currentTrack: null,
    loading: true,
    error: null
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const loadSpotifyData = useCallback(async () => {
    try {
      setSpotifyData(prev => ({ ...prev, loading: true, error: null }));

      const [currentTrack, recentTracks] = await Promise.all([
        getCurrentOrRecentMusic(),
        getRecentMusicTracks(5)
      ]);

      const allTracks: (SpotifyTrack | SpotifyRecentTrack)[] = [];

      if (currentTrack && 'is_playing' in currentTrack && currentTrack.is_playing) {
        allTracks.push(currentTrack);
      }

      const trackSet = new Set(allTracks.map(t => `${t.name}-${t.artist}`));
      recentTracks.forEach(track => {
        const key = `${track.name}-${track.artist}`;
        if (!trackSet.has(key)) {
          allTracks.push(track);
          trackSet.add(key);
        }
      });

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

  // Load data only on mount - no polling
  useEffect(() => {
    loadSpotifyData();
  }, [loadSpotifyData]);

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
    }, 5950);

    return () => clearInterval(interval);
  }, [spotifyData.tracks.length, isPaused]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    setHoveredTrack(currentTrackIndex);
  }, [currentTrackIndex]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    setHoveredTrack(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Use clientX/clientY for viewport-relative coordinates
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  }, []);



  const { currentTrack, loading, error } = spotifyData;

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={buildTransition(0)}
        className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30"
        aria-labelledby="spotify-heading"
      >
        <h3 id="spotify-heading" className="sr-only">Music Activity</h3>
        <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0">
          <Music className="w-4 h-4 text-green-500 animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body text-muted-foreground leading-tight h-5 flex items-center gap-2">
            <div className="h-4 bg-muted/60 rounded-md w-full max-w-[120px] xs:max-w-[150px] animate-pulse"></div>
            <div className="h-4 bg-muted/50 rounded-md w-6 animate-pulse flex-shrink-0"></div>
            <div className="h-4 bg-muted/60 rounded-md w-full max-w-[100px] xs:max-w-[120px] animate-pulse"></div>
          </div>
          <div className="text-sm text-muted-foreground leading-tight h-4 flex items-center mt-1">
            <div className="h-3 bg-muted/40 rounded-md w-full max-w-[120px] xs:max-w-[150px] animate-pulse"></div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"></div>
      </motion.section>
    );
  }

  if (error || !currentTrack) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={buildTransition(0)}
        className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30"
        aria-labelledby="spotify-heading"
      >
        <h3 id="spotify-heading" className="sr-only">Music Activity</h3>
        <div className="p-1.5 bg-muted/50 rounded-lg flex-shrink-0">
          <Music className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="text-body text-muted-foreground leading-tight h-5 flex items-center">
          No music playing right now
        </div>
      </motion.section>
    );
  }

  const isCurrentlyPlaying = 'is_playing' in currentTrack && currentTrack.is_playing;
  const isRecentTrack = 'played_at' in currentTrack;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={buildTransition(0)}
      className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      aria-labelledby="spotify-heading"
    >
      <h3 id="spotify-heading" className="sr-only">Music Activity</h3>
      <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0">
        {isCurrentlyPlaying ? (
          <Play className="w-4 h-4 text-green-500" aria-hidden="true" />
        ) : (
          <Music className="w-4 h-4 text-green-500" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0 transition-all duration-300 ease-out">
        <div className="flex items-start gap-3">
          {/* Text content - two lines like GitHub activity */}
          <div className="flex-1 min-w-0">
            {/* First line - track and artist */}
            <div className="text-body text-muted-foreground leading-tight mb-2">
              <span className="flex-shrink-0">
                {isCurrentlyPlaying ? 'Currently listening to' : 'Whilst probably listening to'}{" "}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`track-${currentTrackIndex}`}
                  className="inline-block font-semibold text-foreground"
                  initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                  transition={buildTransition(0)}
                >
                  <a
                    href={currentTrack.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                    title={`Listen to ${currentTrack.name} on Spotify`}
                  >
                    {currentTrack.name}
                  </a>
                </motion.span>
              </AnimatePresence>
              <span className="flex-shrink-0"> by </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`artist-${currentTrackIndex}`}
                  className="inline-block font-medium text-foreground"
                  initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                  transition={buildTransition(1)}
                >
                  <span title={currentTrack.artist}>
                    {currentTrack.artist}
                  </span>
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Second line - album and timestamp */}
            <div className="text-sm text-muted-foreground leading-tight">
              {currentTrack.album && (
                <>
                  <span className="flex-shrink-0">from</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`album-${currentTrackIndex}`}
                      className="inline-block ml-1 italic"
                      initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                      transition={buildTransition(2)}
                    >
                      <span title={currentTrack.album}>
                        {currentTrack.album}
                      </span>
                    </motion.span>
                  </AnimatePresence>
                </>
              )}
              {isRecentTrack && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`timestamp-${currentTrackIndex}`}
                    className="inline-block ml-2 text-muted-foreground"
                    initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                    transition={buildTransition(3)}
                  >
                    (<AnimatedTimestamp timestamp={formatTimestamp(currentTrack.played_at)} delay={150} />)
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right side - album cover only */}
          {currentTrack.image_url && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`image-${currentTrackIndex}`}
                className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(2px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(2px)" }}
                transition={{
                  duration: STAGGER_DURATION,
                  delay: 4 * DELAY_STEP,
                  ease: STAGGER_EASE,
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
      </div>


      <SpotifyHoverCard
        track={currentTrack}
        isVisible={hoveredTrack === currentTrackIndex}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        mousePosition={mousePosition}
      />
    </motion.section>
  );
});
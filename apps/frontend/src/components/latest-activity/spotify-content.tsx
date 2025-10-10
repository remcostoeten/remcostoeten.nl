'use client';

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service";
import { formatTimestamp } from "./utils";
import { SpotifyHoverCard } from "./spotify-hover-card";
import { AnimatedTimestamp } from "../../shared/components/animated-numbers";

/**
 * SpotifyActivityContent - Pure content component for Spotify activity
 * 
 * This component only handles the dynamic content (track, artist, album, timestamp, image)
 * The layout structure and icons are provided by the parent shell component.
 * This separation ensures zero layout shift.
 */

interface SpotifyActivityContentProps {
  currentTrack: SpotifyTrack | SpotifyRecentTrack;
  currentTrackIndex: number;
  hoveredTrack: number | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  mousePosition: { x: number; y: number };
}

export const SpotifyActivityContent = memo(function SpotifyActivityContent({
  currentTrack,
  currentTrackIndex,
  hoveredTrack,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  mousePosition
}: SpotifyActivityContentProps) {

  // Enhanced staggered animation constants
  const STAGGER_DURATION = 0.8;
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const BASE_DELAY = 0.2; // Base delay before first element starts (slightly later than GitHub)
  const STAGGER_DELAY = 0.12; // Delay between each element

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + (order * STAGGER_DELAY),
      ease: STAGGER_EASE,
      filter: { duration: 0.4 }
    };
  }

  const isCurrentlyPlaying = 'is_playing' in currentTrack && currentTrack.is_playing;
  const isRecentTrack = 'played_at' in currentTrack;

  return (
    <div className="flex items-start gap-3 relative group">
      <div
        className="flex items-start gap-3 flex-1"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        <div className="flex-1 min-w-0">
          <div className="text-body text-muted-foreground leading-tight">
            <span className="flex-shrink-0">
              {isCurrentlyPlaying ? 'Currently listening to' : 'Whilst probably listening to'}{" "}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={`track-${currentTrackIndex}`}
                className="inline-block font-semibold text-foreground"
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={buildStaggerTransition(0)}
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
            <AnimatePresence mode="wait">
              <motion.span
                key={`by-${currentTrackIndex}`}
                className="inline-block px-[3px]"
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={buildStaggerTransition(0.5)}
              >
                by
              </motion.span>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.span
                key={`artist-${currentTrackIndex}`}
                className="inline-block font-medium text-foreground"
                initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={buildStaggerTransition(1)}
              >
                <span title={currentTrack.artist}>
                  {currentTrack.artist
                    ? currentTrack.artist.length > 20
                      ? currentTrack.artist.substring(0, 20) + '...'
                      : currentTrack.artist
                    : 'Unknown Artist'
                  }
                </span>
              </motion.span>
            </AnimatePresence>
            {currentTrack.album && (
              <>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`from-${currentTrackIndex}`}
                    className="inline-block px-[3px]"
                    initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                    transition={buildStaggerTransition(1.5)}
                  >
                    -
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`album-${currentTrackIndex}`}
                    className="inline-block italic text-sm"
                    initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                    transition={buildStaggerTransition(2)}
                  >
                    <span title={currentTrack.album}>
                      {currentTrack.album.length > 25
                        ? currentTrack.album.substring(0, 25) + '...'
                        : currentTrack.album}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </>
            )}
          </div>
          {isRecentTrack && (
            <div className="text-sm text-muted-foreground leading-tight mt-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`timestamp-${currentTrackIndex}`}
                  className="inline-block text-muted-foreground whitespace-nowrap"
                  initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                  transition={buildStaggerTransition(3)}
                >
                  (<AnimatedTimestamp timestamp={formatTimestamp(currentTrack.played_at)} delay={BASE_DELAY + (3 * STAGGER_DELAY) * 1000 + 100} />)
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right side - album cover only */}
        {currentTrack.image_url && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${currentTrackIndex}`}
              className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(3px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(3px)" }}
              transition={buildStaggerTransition(4)} // Fifth element (album cover - deepest)
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

      {/* Hover Card - positioned relative to container */}
      <div className="absolute left-0 top-full mt-2 z-[999999] w-80 max-w-[90vw]">
        <SpotifyHoverCard
          track={currentTrack}
          isVisible={hoveredTrack === currentTrackIndex}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          mousePosition={mousePosition}
        />
      </div>
    </div>
  );
});

/**
 * SpotifyActivitySkeletonContent - Skeleton content that matches real content dimensions
 * Now with staggered fade-out animations
 */
export function SpotifyActivitySkeletonContent({ showCurrentlyPlaying = false }: { showCurrentlyPlaying?: boolean }) {
  // Match the same stagger timing as real content
  const STAGGER_DURATION = 0.8;
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const BASE_DELAY = 0.2; // Slightly later than GitHub
  const STAGGER_DELAY = 0.12;

  function buildStaggerTransition(order: number) {
    return {
      duration: STAGGER_DURATION,
      delay: BASE_DELAY + (order * STAGGER_DELAY),
      ease: STAGGER_EASE,
      filter: { duration: 0.4 }
    };
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        {/* First line - Static text + skeleton content */}
        <div className="text-body text-muted-foreground leading-tight">
          <span className="flex-shrink-0">
            {showCurrentlyPlaying ? 'Currently listening to' : 'Whilst probably listening to'}{" "}
          </span>
          {/* Skeleton for track name */}
          <span className="inline-block font-semibold text-foreground">
            <motion.span
              className="h-5 bg-muted/60 rounded-md animate-pulse w-[160px] max-w-[250px] inline-block align-middle"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(0)}
            />
          </span>
          <motion.span
            className="inline-block h-5 bg-muted/60 rounded-md animate-pulse w-[20px] mx-1 align-middle"
            initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
            transition={buildStaggerTransition(0.5)}
          />
          {/* Skeleton for artist name */}
          <span className="inline-block font-medium text-foreground">
            <motion.span
              className="h-5 bg-muted/60 rounded-md animate-pulse w-[120px] max-w-[180px] inline-block align-middle"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(1)}
            />
          </span>
          {/* Skeleton for separator */}
          <motion.span
            className="inline-block h-5 bg-muted/40 rounded-md animate-pulse w-[12px] mx-1 align-middle"
            initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
            transition={buildStaggerTransition(1.5)}
          />
          {/* Skeleton for album name */}
          <span className="inline-block italic text-sm">
            <motion.span
              className="h-4 bg-muted/40 rounded-md animate-pulse w-[140px] max-w-[200px] inline-block align-middle"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(2)}
            />
          </span>
        </div>

        {/* Second line - timestamp */}
        <div className="text-sm text-muted-foreground leading-tight mt-1">
          <span className="inline-block text-muted-foreground">
            (<motion.span
              className="h-4 bg-muted/40 rounded-md animate-pulse w-[50px] inline-block align-middle"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(3)}
            />)
          </span>
        </div>
      </div>

      {/* Right side - album cover skeleton */}
      <motion.div
        className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"
        initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        animate={{ opacity: 0, filter: "blur(3px)", scale: 0.95 }}
        transition={buildStaggerTransition(4)}
      />
    </div>
  );
}

/**
 * SpotifyActivityErrorContent - Error state content
 */
export function SpotifyActivityErrorContent() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-body text-muted-foreground leading-tight h-5 flex items-center">
          No music playing right now
        </div>
      </div>
    </div>
  );
}

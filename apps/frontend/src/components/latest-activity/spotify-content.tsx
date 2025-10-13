'use client';

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service";
import { formatTimestamp } from "./utils";
import { SpotifyHoverCard } from "./spotify-hover-card";
import { AnimatedTimestamp } from "../../shared/components/animated-numbers";

type TProps = {
  currentTrack: SpotifyTrack | SpotifyRecentTrack;
  currentTrackIndex: number;
  hoveredTrack: number | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  mousePosition: { x: number; y: number };
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

function calculateLine1Length(prefix: string, trackName: string, artistName: string): number {
  return prefix.length + trackName.length + 4 + artistName.length;
}

function smartTruncateLine1(
  prefix: string,
  trackName: string,
  artistName: string,
  maxLength: number
): { track: string; artist: string } {
  const staticLength = prefix.length + 4;
  const availableLength = maxLength - staticLength;
  const totalLength = trackName.length + artistName.length;

  if (totalLength <= availableLength) {
    return { track: trackName, artist: artistName };
  }

  const trackRatio = 0.6;
  const artistRatio = 0.4;
  const trackMax = Math.floor(availableLength * trackRatio);
  const artistMax = Math.floor(availableLength * artistRatio);

  return {
    track: truncateText(trackName, trackMax),
    artist: truncateText(artistName, artistMax)
  };
}

function smartTruncateLine2(
  albumName: string,
  timestamp: string,
  maxLength: number
): string {
  const timestampLength = timestamp.length + 3;
  const separator = " - ";
  const availableForAlbum = maxLength - timestampLength - separator.length;

  if (availableForAlbum < 10) {
    return truncateText(albumName, maxLength - timestampLength - separator.length) + separator.slice(0, -1);
  }

  return truncateText(albumName, availableForAlbum);
}

export const SpotifyActivityContent = memo(function SpotifyActivityContent({
  currentTrack,
  currentTrackIndex,
  hoveredTrack,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  mousePosition
}: TProps) {

  const STAGGER_DURATION = 0.8;
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const BASE_DELAY = 0.2;
  const STAGGER_DELAY = 0.12;
  const MAX_LINE1_LENGTH = 70;
  const MAX_LINE2_LENGTH = 55;

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
  const prefix = isCurrentlyPlaying ? 'Currently listening to' : 'Whilst probably listening to';
  
  const truncated = smartTruncateLine1(
    prefix,
    currentTrack.name,
    currentTrack.artist || 'Unknown Artist',
    MAX_LINE1_LENGTH
  );

  const timestampText = isRecentTrack ? formatTimestamp((currentTrack as SpotifyRecentTrack).played_at) : '';
  const truncatedAlbum = currentTrack.album 
    ? smartTruncateLine2(currentTrack.album, timestampText, MAX_LINE2_LENGTH)
    : '';

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
            <span className="inline">
              {prefix}{" "}
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
                  {truncated.track}
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
                  {truncated.artist}
                </span>
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-sm text-muted-foreground leading-tight mt-1">
            {currentTrack.album && (
              <>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`album-${currentTrackIndex}`}
                    className="inline-block italic"
                    initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                    transition={buildStaggerTransition(2)}
                  >
                    <span title={currentTrack.album}>
                      - {truncatedAlbum}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </>
            )}
            {isRecentTrack && (
              <>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`space-${currentTrackIndex}`}
                    className="inline-block px-[3px]"
                    initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                    transition={buildStaggerTransition(2.5)}
                  >
                    {" "}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`timestamp-${currentTrackIndex}`}
                    className="inline-block text-muted-foreground whitespace-nowrap"
                    initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                    transition={buildStaggerTransition(3)}
                  >
                    <span>(</span>
                    <AnimatedTimestamp timestamp={timestampText} delay={BASE_DELAY + (3 * STAGGER_DELAY) * 1000 + 100} />
                    <span>)</span>
                  </motion.span>
                </AnimatePresence>
              </>
            )}
          </div>
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
  const STAGGER_DURATION = 0.8;
  const STAGGER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const BASE_DELAY = 0.2;
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
        <div className="text-body text-muted-foreground leading-tight">
          <span className="flex-shrink-0">
            {showCurrentlyPlaying ? 'Currently listening to' : 'Whilst probably listening to'}{" "}
          </span>
          <span className="inline-block font-semibold text-foreground">
            <motion.span
              className="h-5 bg-muted/60 rounded-md animate-pulse w-[160px] inline-block align-middle"
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
          <span className="inline-block font-medium text-foreground">
            <motion.span
              className="h-5 bg-muted/60 rounded-md animate-pulse w-[120px] inline-block align-middle"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(1)}
            />
          </span>
        </div>
        <div className="text-sm text-muted-foreground leading-tight mt-1">
          <span className="inline-block italic">
            <motion.span
              className="h-4 bg-muted/40 rounded-md animate-pulse w-[140px] inline-block align-middle"
              initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
              transition={buildStaggerTransition(2)}
            />
          </span>
          <motion.span
            className="inline-block h-4 bg-muted/40 rounded-md animate-pulse w-[12px] mx-1 align-middle"
            initial={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            animate={{ opacity: 0, filter: "blur(2px)", y: -4 }}
            transition={buildStaggerTransition(2.5)}
          />
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

'use client';

import { memo } from "react";
import { motion } from "framer-motion";
import { Music, ExternalLink, Clock, Calendar } from "lucide-react";
import type { SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service";
import { formatTimestamp } from "./utils";

interface SpotifyHoverCardProps {
  track: SpotifyTrack | SpotifyRecentTrack;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  mousePosition: { x: number; y: number };
}

export const SpotifyHoverCard = memo(function SpotifyHoverCard({ 
  track, 
  isVisible, 
  onMouseEnter, 
  onMouseLeave,
  mousePosition
}: SpotifyHoverCardProps) {
  if (!isVisible) return null;

  const isCurrentlyPlaying = 'is_playing' in track && track.is_playing;
  const isRecentTrack = 'played_at' in track;

  // Calculate optimal position
  const cardWidth = 320;
  const cardHeight = 200;
  const offset = 12;
  
  let left = mousePosition.x + offset;
  let top = mousePosition.y + offset;
  
  // Adjust if card would go off screen
  if (typeof window !== 'undefined') {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check right edge
    if (left + cardWidth > viewportWidth - 20) {
      left = mousePosition.x - cardWidth - offset;
    }
    
    // Check bottom edge
    if (top + cardHeight > viewportHeight - 20) {
      top = mousePosition.y - cardHeight - offset;
    }
    
    // Ensure card doesn't go off left edge
    if (left < 20) {
      left = 20;
    }
    
    // Ensure card doesn't go off top edge
    if (top < 20) {
      top = 20;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed w-80 max-w-[90vw] isolate pointer-events-none"
      style={{ 
        zIndex: 999999,
        left: `${left}px`,
        top: `${top}px`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="tooltip"
      aria-live="polite"
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl p-5 relative backdrop-blur-xl pointer-events-auto"
        style={{ zIndex: 999999 }}>
        <div className="flex items-start gap-4">
          {/* Album Art */}
          {track.image_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
              <img
                src={track.image_url}
                alt={`${track.album} album cover`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {track.name}
                </h3>
                <p className="text-muted-foreground text-sm truncate">
                  by {track.artist}
                </p>
                {track.album && (
                  <p className="text-muted-foreground text-xs truncate mt-1">
                    from {track.album}
                  </p>
                )}
              </div>
              <a
                href={track.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-green-500 transition-all duration-200 ml-3 flex-shrink-0 p-1.5 hover:bg-green-500/10 rounded-lg"
                aria-label={`Listen to ${track.name} on Spotify`}
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Music className="w-4 h-4 text-green-500" aria-hidden="true" />
                <span className="text-muted-foreground">
                  {isCurrentlyPlaying ? 'Currently playing' : 'Recently played'}
                </span>
              </div>

              {isRecentTrack && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {formatTimestamp(track.played_at)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-border/60">
                <a
                  href={track.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-green-500 hover:text-green-400 transition-colors font-medium"
                >
                  <Music className="w-4 h-4" />
                  Open in Spotify
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
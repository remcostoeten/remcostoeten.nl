'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, GitBranch, Calendar, Clock, User, ExternalLink, Code, Disc } from 'lucide-react';
import type { CommitData } from '@/hooks/use-github';
import type { SpotifyTrack } from '@/core/spotify-service';
import { getRelativeTime } from '@/core/spotify-service';

interface ActivityHoverCardProps {
  type: 'github' | 'spotify';
  data: CommitData | SpotifyTrack;
  isVisible: boolean;
  position: { x: number; y: number };
}

const cardVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: -8
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    transition: { duration: 0.15 }
  }
};

export const ActivityHoverCard = React.memo(({ type, data, isVisible, position }: ActivityHoverCardProps) => {
  if (!isVisible) return null;

  const isGitHub = type === 'github';
  const commit = data as CommitData & { projectName?: string; color?: string };
  const track = data as SpotifyTrack;

  const getCardPosition = () => {
    const cardWidth = 340; // Approximate card width
    const cardHeight = 200; // Approximate card height
    const offset = 20; // Distance from cursor

    let x = position.x + offset;
    let y = position.y + offset;

    if (x + cardWidth > window.innerWidth - 20) {
      x = position.x - cardWidth - offset;
    }

    if (x < 20) {
      x = 20;
    }

    if (y + cardHeight > window.innerHeight - 20) {
      y = position.y - cardHeight - offset;
    }

    if (y < 20) {
      y = 20;
    }

    return { x, y };
  };

  const cardPosition = getCardPosition();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed z-50 pointer-events-none"
        style={{
          left: cardPosition.x,
          top: cardPosition.y
        }}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="relative">
          <div className="relative bg-background border border-border rounded-xl shadow-lg overflow-hidden min-w-[300px] max-w-[380px]">
            <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">
                  {isGitHub ? <GitBranch className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isGitHub ? 'Recent Commit' : 'Now Playing'}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {isGitHub ? commit.projectName : track.artist}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 space-y-3">
              <div>
                <div className="text-sm font-medium text-foreground leading-relaxed">
                  {isGitHub ? commit.message.split('\n')[0] : track.name}
                </div>
                {!isGitHub && track.album && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Disc className="w-3 h-3" />
                    {track.album}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{getRelativeTime(isGitHub ? commit.date : track.played_at)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(isGitHub ? commit.date : track.played_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {isGitHub && commit.author && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{commit.author}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isGitHub ? <Code className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                  <span className="font-mono">
                    {isGitHub ? commit.shortHash : 'Spotify'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground/70">
                  {isGitHub ? 'View commit details' : 'Listen on Spotify'}
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

ActivityHoverCard.displayName = 'ActivityHoverCard';

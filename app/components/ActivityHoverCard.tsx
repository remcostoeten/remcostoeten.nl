'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, GitBranch, Calendar, Clock, User, ExternalLink, Code, Disc } from 'lucide-react';
import type { CommitData } from '../core/github-service';
import type { SpotifyTrack } from '../core/spotify-service';
import { formatRelativeTime } from '../utils/shared';

interface ActivityHoverCardProps {
  type: 'github' | 'spotify';
  data: CommitData | SpotifyTrack;
  isVisible: boolean;
  position: { x: number; y: number };
}

const cardVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10,
    filter: 'blur(8px)'
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10,
    filter: 'blur(4px)',
    transition: { duration: 0.2 }
  }
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: { 
    x: '100%', 
    transition: { 
      repeat: Infinity, 
      duration: 2, 
      ease: 'linear' 
    } 
  }
};

export const ActivityHoverCard = React.memo(({ type, data, isVisible, position }: ActivityHoverCardProps) => {
  if (!isVisible) return null;

  const isGitHub = type === 'github';
  const commit = data as CommitData & { projectName?: string; color?: string };
  const track = data as SpotifyTrack;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed z-50 pointer-events-none"
        style={{ 
          left: position.x, 
          top: position.y,
          transform: 'translate(-50%, -120%)'
        }}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
          
          {/* Main card */}
          <div className="relative bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden min-w-[320px] max-w-[400px]">
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
            
            {/* Header */}
            <div className={`relative px-5 py-4 bg-gradient-to-r ${
              isGitHub 
                ? 'from-blue-500/10 via-indigo-500/10 to-purple-500/10' 
                : 'from-green-500/10 via-emerald-500/10 to-teal-500/10'
            } border-b border-border/40`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  isGitHub 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {isGitHub ? <GitBranch className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
                    {isGitHub ? 'Recent Commit' : 'Now Playing'}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {isGitHub ? commit.projectName : track.artist}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-5 py-4 space-y-4">
              {/* Main info */}
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

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(isGitHub ? commit.date : track.played_at)}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(isGitHub ? commit.date : track.played_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Author (GitHub only) */}
                {isGitHub && commit.author && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{commit.author}</span>
                  </div>
                )}

                {/* Hash/URL */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isGitHub ? <Code className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                  <span className="font-mono">
                    {isGitHub ? commit.shortHash : 'Spotify'}
                  </span>
                </div>
              </div>

              {/* URL link indicator */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div className="text-xs text-muted-foreground/60">
                  {isGitHub ? 'View commit details' : 'Listen on Spotify'}
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground/40" />
              </div>
            </div>

            {/* Accent border */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isGitHub 
                ? 'from-blue-500 via-purple-500 to-pink-500' 
                : 'from-green-500 via-emerald-500 to-teal-500'
            }`} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

ActivityHoverCard.displayName = 'ActivityHoverCard';

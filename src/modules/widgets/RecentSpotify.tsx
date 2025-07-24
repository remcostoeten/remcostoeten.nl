import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrackHoverCard } from './TrackHoverCard';
import type { RecentSpotifyProps } from './types';

export const RecentSpotify = ({ 
  tracks, 
  interval = Number(process.env.REACT_APP_SPOTIFY_WIDGET_CYCLE_INTERVAL) || 3000,
  showHoverCard = false
}: RecentSpotifyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (tracks.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
    }, interval);

    return () => clearInterval(timer);
  }, [tracks.length, interval]);

  if (tracks.length === 0) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground italic"
      >
        no recent tracks
      </motion.span>
    );
  }

  const currentTrack = tracks[currentIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1]
        }}
        className="font-medium text-foreground"
      >
        <TrackHoverCard track={currentTrack} disabled={!showHoverCard}>
          "{currentTrack.name}" by {currentTrack.artists.map(artist => artist.name).join(', ')}
        </TrackHoverCard>
      </motion.span>
    </AnimatePresence>
  );
};

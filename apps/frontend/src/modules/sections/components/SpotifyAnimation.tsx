'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music } from "lucide-react";

const MOCK_SPOTIFY_SONGS = [
  { title: "Midnight City", artist: "M83" },
  { title: "Strobe", artist: "Deadmau5" },
  { title: "Resonance", artist: "HOME" },
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Solar Sails", artist: "Lorn" }
];

export const SpotifyAnimation = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Cycle through songs every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSongIndex((prev) => (prev + 1) % MOCK_SPOTIFY_SONGS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentSong = MOCK_SPOTIFY_SONGS[currentSongIndex];

  return (
    <div className="flex items-center gap-2">
      <Music className="w-4 h-4 text-accent flex-shrink-0" />
      <span>
        while listening to{" "}
        <motion.span
          key={currentSongIndex}
          className="font-medium text-foreground inline-block"
          initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
            filter: { duration: 0.4 }
          }}
        >
          {currentSong.title}
        </motion.span>
        {" "}by{" "}
        <motion.span
          key={`${currentSongIndex}-artist`}
          className="text-accent inline-block"
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
          {currentSong.artist}
        </motion.span>
      </span>
    </div>
  );
};
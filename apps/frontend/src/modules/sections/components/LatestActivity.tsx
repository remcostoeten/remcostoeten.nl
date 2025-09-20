'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCommit, Music } from "lucide-react";

// Mock data - replace with real API calls later
const MOCK_GITHUB_DATA = {
  latestCommit: "Updated project dependencies and fixed mobile responsiveness",
  project: "nextjs-15-roll-your-own-authentication",
  timestamp: "2 hours ago"
};

const MOCK_SPOTIFY_SONGS = [
  { title: "Midnight City", artist: "M83" },
  { title: "Strobe", artist: "Deadmau5" },
  { title: "Resonance", artist: "HOME" },
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Solar Sails", artist: "Lorn" }
];

export const LatestActivity = () => {
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
    <motion.div 
      className="text-body-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg border border-border/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-start gap-2 mb-2">
        <GitCommit className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <span className="leading-relaxed">
          The latest thing I've done is{" "}
          <span className="font-medium text-foreground">
            {MOCK_GITHUB_DATA.latestCommit}
          </span>
          {" "}on{" "}
          <a 
            href={`https://github.com/remcostoeten/${MOCK_GITHUB_DATA.project}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            {MOCK_GITHUB_DATA.project}
          </a>
          {" "}<span className="text-xs">({MOCK_GITHUB_DATA.timestamp})</span>
        </span>
      </div>
      
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
    </motion.div>
  );
};
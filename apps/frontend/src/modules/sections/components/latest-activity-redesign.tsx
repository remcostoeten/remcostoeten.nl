import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music } from "lucide-react";

const MOCK_SPOTIFY_SONGS = [
  { title: "Midnight City", artist: "M83" },
  { title: "Strobe", artist: "Deadmau5" },
  { title: "Resonance", artist: "HOME" },
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Solar Sails", artist: "Lorn" },
  { title: "Weightless", artist: "Marconi Union" },
  { title: "Porcelain", artist: "Moby" },
  { title: "Teardrop", artist: "Massive Attack" }
];

export function SpotifyAnimation() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSongIndex((prev) => (prev + 1) % MOCK_SPOTIFY_SONGS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentSong = MOCK_SPOTIFY_SONGS[currentSongIndex];

  return (
    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
      <div className="p-1.5 bg-accent/10 rounded-lg">
        <Music className="w-4 h-4 text-accent" aria-hidden="true" />
      </div>
      
      <div className="text-sm text-muted-foreground">
        while listening to{" "}
        <AnimatePresence mode="wait">
          <motion.span 
            key={currentSongIndex}
            className="font-semibold text-foreground inline-block"
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
        </AnimatePresence>
        {" "}by{" "}
        <AnimatePresence mode="wait">
          <motion.span 
            key={`${currentSongIndex}-artist`}
            className="text-accent inline-block font-medium"
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
        </AnimatePresence>
      </div>
    </div>
  );
}

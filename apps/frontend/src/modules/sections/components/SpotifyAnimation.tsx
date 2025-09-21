'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, ExternalLink } from "lucide-react";
import { getCurrentOrRecentMusic, SpotifyTrack } from "@/services/spotifyService";

const FALLBACK_SONGS = [
  { title: "Midnight City", artist: "M83" },
  { title: "Strobe", artist: "Deadmau5" },
  { title: "Resonance", artist: "HOME" },
  { title: "Blinding Lights", artist: "The Weeknd" },
  { title: "Solar Sails", artist: "Lorn" }
];

export const SpotifyAnimation = () => {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [useRealSpotify, setUseRealSpotify] = useState(false);

  // Try to load real Spotify data
  useEffect(() => {
    const loadSpotifyData = async () => {
      try {
        const track = await getCurrentOrRecentMusic();
        if (track) {
          setCurrentTrack(track);
          setUseRealSpotify(true);
          console.log('🎵 Loaded Spotify track:', track.name, 'by', track.artist);
        } else {
          console.log('🎵 No Spotify data available, using fallback songs');
          setUseRealSpotify(false);
        }
      } catch (error) {
        console.error('🎵 Error loading Spotify data:', error);
        setUseRealSpotify(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpotifyData();
    
    // Refresh Spotify data every 30 seconds
    const interval = setInterval(loadSpotifyData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through fallback songs if not using real Spotify
  useEffect(() => {
    if (useRealSpotify) return;
    
    const interval = setInterval(() => {
      setFallbackIndex((prev) => (prev + 1) % FALLBACK_SONGS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [useRealSpotify]);

  const displayTrack = useRealSpotify && currentTrack 
    ? { title: currentTrack.name, artist: currentTrack.artist, external_url: currentTrack.external_url }
    : FALLBACK_SONGS[fallbackIndex];

  const isCurrentlyPlaying = useRealSpotify && currentTrack && 'is_playing' in currentTrack && currentTrack.is_playing;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Music className="w-4 h-4 text-accent flex-shrink-0 animate-pulse" />
        <span className="text-muted-foreground">Loading music...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Music className={`w-4 h-4 flex-shrink-0 ${isCurrentlyPlaying ? 'text-green-500 animate-pulse' : 'text-accent'}`} />
      <span>
        {isCurrentlyPlaying ? 'currently listening to' : 'while listening to'}{" "}
        <motion.span
          key={useRealSpotify ? currentTrack?.name : fallbackIndex}
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
          {useRealSpotify && 'external_url' in displayTrack ? (
            <a
              href={displayTrack.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors inline-flex items-center gap-1"
              title="Open in Spotify"
            >
              {displayTrack.title}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            displayTrack.title
          )}
        </motion.span>
        {" "}by{" "}
        <motion.span
          key={useRealSpotify ? `${currentTrack?.artist}` : `${fallbackIndex}-artist`}
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
          {displayTrack.artist}
        </motion.span>
        
        {useRealSpotify && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-green-500 ml-1"
          >
            🎵
          </motion.span>
        )}
      </span>
    </div>
  );
};
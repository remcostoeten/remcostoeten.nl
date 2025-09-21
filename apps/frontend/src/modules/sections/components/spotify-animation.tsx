'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, ExternalLink, Clock, Calendar, Play, Pause } from "lucide-react";
import { getCurrentOrRecentMusic, getRecentMusicTracks, SpotifyTrack, SpotifyRecentTrack } from "@/services/spotify-service";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FALLBACK_SONGS = [
  { title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", played_at: new Date().toISOString() },
  { title: "Strobe", artist: "Deadmau5", album: "For Lack of a Better Name", played_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { title: "Resonance", artist: "HOME", album: "Odyssey", played_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", played_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { title: "Solar Sails", artist: "Lorn", album: "Ask The Dust", played_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
];

export const SpotifyAnimation = () => {
  const [recentTracks, setRecentTracks] = useState<SpotifyRecentTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [useRealSpotify, setUseRealSpotify] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyTrack | null>(null);

  // Try to load real Spotify data
  useEffect(() => {
    const loadSpotifyData = async () => {
      try {
        // First check if something is currently playing
        const currentTrack = await getCurrentOrRecentMusic();
        const isCurrentlyPlaying = currentTrack && 'is_playing' in currentTrack && currentTrack.is_playing;
        
        if (isCurrentlyPlaying) {
          setCurrentlyPlaying(currentTrack as SpotifyTrack);
          setUseRealSpotify(true);
          console.log('🎵 Currently playing:', currentTrack.name, 'by', currentTrack.artist);
        } else {
          setCurrentlyPlaying(null);
          
          // Get recent tracks for cycling
          const tracks = await getRecentMusicTracks(5);
          if (tracks.length > 0) {
            setRecentTracks(tracks);
            setUseRealSpotify(true);
            console.log('🎵 Loaded', tracks.length, 'recent Spotify tracks');
          } else {
            console.log('🎵 No Spotify data available, using fallback songs');
            setUseRealSpotify(false);
            setRecentTracks(FALLBACK_SONGS);
          }
        }
      } catch (error) {
        console.error('🎵 Error loading Spotify data:', error);
        setUseRealSpotify(false);
        setRecentTracks(FALLBACK_SONGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpotifyData();
    
    // Refresh Spotify data every 30 seconds
    const interval = setInterval(loadSpotifyData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through tracks every 4 seconds (only if not currently playing)
  useEffect(() => {
    if (currentlyPlaying || recentTracks.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentTrackIndex((prev) => (prev + 1) % recentTracks.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentlyPlaying, recentTracks.length]);

  // Get current display track
  const displayTrack = currentlyPlaying || (recentTracks.length > 0 ? recentTracks[currentTrackIndex] : FALLBACK_SONGS[0]);
  const isPlaying = !!currentlyPlaying;
  const allTracks = currentlyPlaying ? [currentlyPlaying, ...recentTracks] : recentTracks;

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors">
            <Music className={`w-4 h-4 flex-shrink-0 ${isPlaying ? 'text-green-500 animate-pulse' : 'text-accent'}`} />
            <span>
              {isPlaying ? 'currently listening to' : 'while listening to'}{" "}
              <motion.span
                key={currentlyPlaying ? currentlyPlaying.name : currentTrackIndex}
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
                  <span className="hover:text-accent transition-colors inline-flex items-center gap-1">
                    {displayTrack.name}
                  </span>
                ) : (
                  displayTrack.name || displayTrack.title
                )}
              </motion.span>
              {" "}by{" "}
              <motion.span
                key={currentlyPlaying ? `${currentlyPlaying.artist}` : `${currentTrackIndex}-artist`}
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
              
              {recentTracks.length > 1 && !currentlyPlaying && (
                <motion.span 
                  className="text-xs text-muted-foreground ml-2"
                  key={`counter-${currentTrackIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  ({currentTrackIndex + 1}/{recentTracks.length})
                </motion.span>
              )}
            </span>
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-accent" />
              <h3 className="font-medium text-sm">
                {isPlaying ? 'Currently Playing' : 'Recent Tracks'}
              </h3>
              {useRealSpotify && (
                <span className="text-xs text-green-500">🎵 Live</span>
              )}
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allTracks.slice(0, 5).map((track, index) => {
                const isCurrentTrack = currentlyPlaying ? index === 0 : index === currentTrackIndex;
                const trackName = track.name || (track as any).title;
                const trackArtist = track.artist;
                const trackAlbum = track.album;
                const playedAt = 'played_at' in track ? track.played_at : new Date().toISOString();
                const externalUrl = 'external_url' in track ? track.external_url : undefined;
                const imageUrl = 'image_url' in track ? track.image_url : undefined;
                
                return (
                  <div
                    key={`${trackName}-${index}`}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                      isCurrentTrack ? 'bg-accent/10 border border-accent/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={trackAlbum}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {externalUrl ? (
                            <a
                              href={externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-accent transition-colors inline-flex items-center gap-1"
                            >
                              {trackName}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          ) : (
                            trackName
                          )}
                        </p>
                        {isCurrentTrack && currentlyPlaying && (
                          <div className="flex items-center gap-1">
                            {currentlyPlaying.is_playing ? (
                              <Play className="w-3 h-3 text-green-500" />
                            ) : (
                              <Pause className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{trackArtist}</p>
                      <p className="text-xs text-muted-foreground/70 truncate">{trackAlbum}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {currentlyPlaying && index === 0 ? (
                        <span className="text-xs text-green-500 font-medium">Now</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatTimeAgo(playedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {useRealSpotify && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Powered by Spotify • Updates every 30s
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
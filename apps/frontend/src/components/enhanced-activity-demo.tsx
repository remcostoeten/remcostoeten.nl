'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCommit, Music, Star, GitBranch, Users, RefreshCw } from "lucide-react";
import { getCurrentOrRecentMusic } from "@/services/spotify-service";

export function EnhancedActivityDemo() {
  const [spotifyTrack, setSpotifyTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refreshData = async () => {
    setLoading(true);
    try {
      const track = await getCurrentOrRecentMusic();
      setSpotifyTrack(track);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="p-6 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Enhanced Activity Integration</h3>
        <button
          onClick={refreshData}
          disabled={loading}
          className="p-2 hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* GitHub Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <GitCommit className="w-4 h-4 text-accent" />
          </div>
          <div className="text-sm text-muted-foreground">
            Latest development activity integrated with real-time data
          </div>
        </div>

        {/* Project Statistics */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground pl-11">
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span>Multiple projects</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>Real GitHub stats</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Live data</span>
          </div>
        </div>
      </div>

      {/* Spotify Integration Section */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Music className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading Spotify data...
              </div>
            ) : spotifyTrack ? (
              <div className="text-sm text-muted-foreground">
                {'is_playing' in spotifyTrack && spotifyTrack.is_playing ? 'Currently listening to' : 'Recently played'}{" "}
                <a
                  href={spotifyTrack.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-accent transition-colors"
                >
                  {spotifyTrack.name}
                </a>
                {" "}by{" "}
                <span className="font-medium text-foreground">
                  {spotifyTrack.artist}
                </span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No music data available (check Spotify integration)
              </div>
            )}
          </div>
          {spotifyTrack?.image_url && (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
              <img
                src={spotifyTrack.image_url}
                alt="Album cover"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="text-xs text-muted-foreground">
          Last updated: {lastRefresh.toLocaleTimeString()} • 
          Real API integration active • 
          Auto-refresh every 30s
        </div>
      </div>
    </motion.div>
  );
}
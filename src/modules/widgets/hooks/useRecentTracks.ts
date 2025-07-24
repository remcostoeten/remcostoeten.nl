import { useState, useEffect, useCallback } from 'react';
import { spotify } from '@remcostoeten/fync';
import type { Track, UseRecentTracksOptions, UseRecentTracksReturn } from '../types';

export const useRecentTracks = ({
  limit = Number(process.env.REACT_APP_SPOTIFY_WIDGET_TRACK_LIMIT) || 5,
  refreshInterval = Number(process.env.REACT_APP_SPOTIFY_WIDGET_REFRESH_INTERVAL) || 0
}: UseRecentTracksOptions = {}): UseRecentTracksReturn => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // You'll need to pass your Spotify access token here
      // This is just an example - you should get the token from your auth system
      const accessToken = process.env.REACT_APP_SPOTIFY_ACCESS_TOKEN || '';
      
      if (!accessToken) {
        throw new Error('Spotify access token not found');
      }

      const recentTracks = await spotify(accessToken)
        .getRecentlyPlayed({ limit });

      // Transform the response to match our Track interface
      const transformedTracks: Track[] = recentTracks.items?.map((item: unknown) => {
        const trackItem = item as {
          track: {
            name: string;
            artists: Array<{
              name: string;
              id: string;
              external_urls: { spotify: string };
            }>;
            album: {
              name: string;
              images: Array<{ url: string; width: number; height: number }>;
              release_date: string;
              total_tracks: number;
              external_urls: { spotify: string };
            };
            duration_ms: number;
            explicit: boolean;
            external_urls: { spotify: string };
            popularity: number;
            preview_url: string;
            id: string;
          };
          played_at: string;
        };
        
        return {
          name: trackItem.track.name,
          artists: trackItem.track.artists?.map((artist) => ({
            name: artist.name,
            id: artist.id,
            external_urls: artist.external_urls
          })) || [],
          album: {
            name: trackItem.track.album.name,
            images: trackItem.track.album.images,
            release_date: trackItem.track.album.release_date,
            total_tracks: trackItem.track.album.total_tracks,
            external_urls: trackItem.track.album.external_urls
          },
          duration_ms: trackItem.track.duration_ms,
          explicit: trackItem.track.explicit,
          external_urls: trackItem.track.external_urls,
          popularity: trackItem.track.popularity,
          preview_url: trackItem.track.preview_url,
          id: trackItem.track.id,
          played_at: trackItem.played_at
        };
      }) || [];

      setTracks(transformedTracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracks');
      console.error('Error fetching recent tracks:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTracks();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchTracks, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTracks, refreshInterval]);

  return {
    tracks,
    loading,
    error,
    refetch: fetchTracks
  };
};

import { useState, useEffect } from 'react';
import { spotify } from '@remcostoeten/fync';
import type { Track, UseRecentTracksOptions, UseRecentTracksReturn } from '../types';

export const useRecentTracks = ({
  limit = 5,
  refreshInterval = 0
}: UseRecentTracksOptions = {}): UseRecentTracksReturn => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = async () => {
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
      const transformedTracks: Track[] = recentTracks.items?.map((item: any) => ({
        name: item.track.name,
        artists: item.track.artists,
        album: {
          name: item.track.album.name
        }
      })) || [];

      setTracks(transformedTracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracks');
      console.error('Error fetching recent tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchTracks, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, refreshInterval]);

  return {
    tracks,
    loading,
    error,
    refetch: fetchTracks
  };
};

import { useState, useEffect } from 'react';
import { spotify } from '@remcostoeten/fync';
import type { Track, UseRecentTracksOptions, UseRecentTracksReturn } from '../types';

export const useRecentTracks = ({
  limit = Number(process.env.REACT_APP_SPOTIFY_WIDGET_TRACK_LIMIT) || 5,
  refreshInterval = Number(process.env.REACT_APP_SPOTIFY_WIDGET_REFRESH_INTERVAL) || 0
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
        artists: item.track.artists?.map((artist: any) => ({
          name: artist.name,
          id: artist.id,
          external_urls: artist.external_urls
        })) || [],
        album: {
          name: item.track.album.name,
          images: item.track.album.images,
          release_date: item.track.album.release_date,
          total_tracks: item.track.album.total_tracks,
          external_urls: item.track.album.external_urls
        },
        duration_ms: item.track.duration_ms,
        explicit: item.track.explicit,
        external_urls: item.track.external_urls,
        popularity: item.track.popularity,
        preview_url: item.track.preview_url,
        id: item.track.id,
        played_at: item.played_at
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

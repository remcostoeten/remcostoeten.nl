export interface Track {
  name: string;
  artists: Array<{ name: string; id?: string; external_urls?: { spotify?: string } }>;
  album: {
    name: string;
    images?: Array<{ url: string; width?: number; height?: number }>;
    release_date?: string;
    total_tracks?: number;
    external_urls?: { spotify?: string };
  };
  duration_ms?: number;
  explicit?: boolean;
  external_urls?: { spotify?: string };
  popularity?: number;
  preview_url?: string;
  id?: string;
  played_at?: string;
}

export interface RecentSpotifyProps {
  tracks: Track[];
  interval?: number;
  showHoverCard?: boolean;
}

export interface ListeningStatusProps {
  prefixText?: string;
  tracks: Track[];
  interval?: number;
  className?: string;
  showHoverCard?: boolean;
}

export interface UseRecentTracksOptions {
  limit?: number;
  refreshInterval?: number;
}

export interface UseRecentTracksReturn {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface Track {
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
  };
}

export interface RecentSpotifyProps {
  tracks: Track[];
  interval?: number;
}

export interface ListeningStatusProps {
  prefixText?: string;
  tracks: Track[];
  interval?: number;
  className?: string;
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

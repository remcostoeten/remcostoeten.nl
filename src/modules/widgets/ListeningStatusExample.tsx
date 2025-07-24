import { ListeningStatus } from './ListeningStatus';
import { useRecentTracks } from './hooks/useRecentTracks';

export const ListeningStatusExample = () => {
  const { tracks, loading, error } = useRecentTracks({
    limit: 5,
    refreshInterval: 60000 // refresh every minute
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <ListeningStatus
      prefixText="while listening to"
      tracks={tracks}
      interval={3000} // cycle tracks every 3 seconds
      className="max-w-md"
      showHoverCard={true} // Enable hover cards with track details
    />
  );
};

// Alternative usage with mock data for testing
export const ListeningStatusDemo = () => {
  const mockTracks = [
    {
      name: "Blinding Lights",
      artists: [{ 
        name: "The Weeknd", 
        id: "1Xyo4u8uXC1ZmMpatF05PJ",
        external_urls: { spotify: "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ" }
      }],
      album: { 
        name: "After Hours",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b27328933b808bfb4cbbd0385400", width: 640, height: 640 }],
        release_date: "2020-03-20",
        total_tracks: 14,
        external_urls: { spotify: "https://open.spotify.com/album/4yP0hdKOZPNshxUOjY0cZj" }
      },
      duration_ms: 200040,
      explicit: false,
      external_urls: { spotify: "https://open.spotify.com/track/0VjIjW4GlULA3cnmDZ8ksYCM" },
      popularity: 95,
      id: "0VjIjW4GlULA3cnmDZ8ksYCM",
      played_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
    },
    {
      name: "Watermelon Sugar",
      artists: [{ 
        name: "Harry Styles", 
        id: "6KImCVD70vtIoJWnq6nGn3",
        external_urls: { spotify: "https://open.spotify.com/artist/6KImCVD70vtIoJWnq6nGn3" }
      }],
      album: { 
        name: "Fine Line",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273277b3fd88030031658439bcd", width: 640, height: 640 }],
        release_date: "2019-12-13",
        total_tracks: 12,
        external_urls: { spotify: "https://open.spotify.com/album/7yf3qPXlEgnf0YePvHFJVd" }
      },
      duration_ms: 174000,
      explicit: false,
      external_urls: { spotify: "https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY" },
      popularity: 89,
      preview_url: "https://p.scdn.co/mp3-preview/...",
      id: "6UelLqGlWMcVH1E5c4H7lY",
      played_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() // 25 minutes ago
    },
    {
      name: "Good 4 U",
      artists: [{ 
        name: "Olivia Rodrigo", 
        id: "1McMsnEElThX1knmY4oliG",
        external_urls: { spotify: "https://open.spotify.com/artist/1McMsnEElThX1knmY4oliG" }
      }],
      album: { 
        name: "SOUR",
        images: [{ url: "https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a", width: 640, height: 640 }],
        release_date: "2021-05-21",
        total_tracks: 11,
        external_urls: { spotify: "https://open.spotify.com/album/6s84u2TUpR3wdUv4NgKA2j" }
      },
      duration_ms: 178147,
      explicit: true,
      external_urls: { spotify: "https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG" },
      popularity: 92,
      id: "4ZtFanR9U6ndgddUvNcjcG",
      played_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
    }
  ];

  return (
    <ListeningStatus
      prefixText="while jamming to"
      tracks={mockTracks}
      interval={2500}
      className="max-w-lg"
      showHoverCard={true} // Enable hover cards with detailed mock data
    />
  );
};

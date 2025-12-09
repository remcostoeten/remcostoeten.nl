export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  url: string;
  image: string;
  played_at: string;
}

const FALLBACK_TRACKS: SpotifyTrack[] = [
  {
    id: '1',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
    image: 'https://i.scdn.co/image/ab67616d0000b27351b6c9225ea311fa4271a77d',
    played_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    url: 'https://open.spotify.com/track/5yUbyW1MfxqBc0ZkUp1xNG',
    image: 'https://i.scdn.co/image/ab67616d0000b2738d2b0c5a3c0eaedaece0a5c5',
    played_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: '3',
    name: 'Heat Waves',
    artist: 'Glass Animals',
    album: 'Dreamland',
    url: 'https://open.spotify.com/track/7Li6WYFTpGI6XnfVDbCxxt',
    image: 'https://i.scdn.co/image/ab67616d0000b273a3c5de4def32adba8d8783a8',
    played_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  }
];

export const getLatestTracks = async (limit = 10): Promise<SpotifyTrack[]> => {
  try {
    console.log('🎵 Fetching Spotify tracks from API...');

    // Try to get real Spotify data
    const response = await fetch(`/api/spotify/recent?limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('🎵 Spotify API error:', errorData.error || 'Unknown error');

      // If no refresh token configured, try to fetch mock data
      if (errorData.error === 'No refresh token configured') {
        console.log('🎵 No Spotify token, trying mock data...');
        try {
          const mockResponse = await fetch('/api/spotify.json');
          if (mockResponse.ok) {
            const mockData = await mockResponse.json();
            if (mockData.tracks && mockData.tracks.length > 0) {
              console.log('✅ Using mock Spotify tracks:', mockData.tracks.length);
              return mockData.tracks;
            }
          }
        } catch (mockError) {
          console.log('🎵 Mock data not available, using hardcoded fallback');
        }
      }

      return FALLBACK_TRACKS;
    }

    const data = await response.json();

    if (data.tracks && data.tracks.length > 0) {
      console.log('✅ Successfully fetched real Spotify tracks:', data.tracks.length);
      return data.tracks;
    }

    console.log('No recent tracks found, using fallback');
    return FALLBACK_TRACKS;
  } catch (error) {
    console.error('🎵 Error fetching Spotify tracks:', error);

    // Try fallback to mock data on network error
    try {
      console.log('🎵 Network error, trying mock data...');
      const mockResponse = await fetch('/api/spotify.json');
      if (mockResponse.ok) {
        const mockData = await mockResponse.json();
        if (mockData.tracks && mockData.tracks.length > 0) {
          console.log('✅ Using mock Spotify tracks:', mockData.tracks.length);
          return mockData.tracks;
        }
      }
    } catch (mockError) {
      console.log('🎵 Mock data not available either, using hardcoded fallback');
    }

    return FALLBACK_TRACKS;
  }
};

// Additional helper function to format track duration
export const formatDuration = (durationMs: number): string => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Helper function to get relative time
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};
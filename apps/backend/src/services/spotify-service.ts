
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

export interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  external_url: string;
  preview_url?: string;
  image_url?: string;
  is_playing: boolean;
  progress_ms?: number;
  duration_ms?: number;
}

export interface SpotifyRecentTrack {
  name: string;
  artist: string;
  album: string;
  external_url: string;
  image_url?: string;
  played_at: string;
}

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  return await response.json();
};

// Get current playing track
export const getCurrentTrack = async (accessToken: string): Promise<SpotifyTrack | null> => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || !response.ok) {
      return null; // Nothing playing
    }

    const data = await response.json();
    
    if (!data.item) return null;

    return {
      name: data.item.name,
      artist: data.item.artists.map((artist: any) => artist.name).join(', '),
      album: data.item.album.name,
      external_url: data.item.external_urls.spotify,
      preview_url: data.item.preview_url,
      image_url: data.item.album.images[0]?.url,
      is_playing: data.is_playing,
      progress_ms: data.progress_ms,
      duration_ms: data.item.duration_ms
    };
  } catch (error) {
    console.error('Error fetching current track:', error);
    return null;
  }
};

// Get recently played tracks
export const getRecentTracks = async (accessToken: string, limit: number = 10): Promise<SpotifyRecentTrack[]> => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      name: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(', '),
      album: item.track.album.name,
      external_url: item.track.external_urls.spotify,
      image_url: item.track.album.images[0]?.url,
      played_at: item.played_at
    }));
  } catch (error) {
    console.error('Error fetching recent tracks:', error);
    return [];
  }
};

// Helper function to get access token (handles refresh automatically)
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    // This would typically be stored in a database or secure storage
    // For now, we'll use the refresh token from env
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    
    if (!refreshToken) {
      console.warn('No Spotify refresh token found');
      return null;
    }

    const tokenData = await refreshAccessToken(refreshToken);
    
    if (tokenData.error) {
      console.error('Error refreshing Spotify token:', tokenData.error);
      return null;
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
};
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

// Generate Spotify authorization URL
export const getSpotifyAuthUrl = (): string => {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  
  console.log('🔍 Spotify Auth Debug:', {
    clientId: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
    redirectUri,
    hasClientId: !!clientId,
    hasRedirectUri: !!process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
  });
  
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set in environment variables');
  }
  
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-read-playback-state'
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri || 'http://127.0.0.1:3000/api/auth/spotify/callback',
    show_dialog: 'true'
  });

  const authUrl = `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
  console.log('🔗 Generated auth URL:', authUrl);
  
  return authUrl;
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  console.log('🔍 Token Exchange Debug:', {
    clientId: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
    clientSecret: clientSecret ? `${clientSecret.substring(0, 8)}...` : 'MISSING',
    redirectUri,
    code: code ? `${code.substring(0, 10)}...` : 'MISSING'
  });

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials in server environment');
  }

  const authString = `${clientId}:${clientSecret}`;
  const base64Auth = Buffer.from(authString).toString('base64');
  
  console.log('🔐 Auth string length:', authString.length);
  console.log('🔐 Base64 auth length:', base64Auth.length);

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64Auth}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri!
    })
  });

  const result = await response.json();
  
  console.log('🎵 Spotify token response:', {
    status: response.status,
    ok: response.ok,
    hasError: !!result.error,
    error: result.error
  });

  return result;
};

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

// Main function to get current or recent music (client-side)
export const getCurrentOrRecentMusic = async (): Promise<SpotifyTrack | SpotifyRecentTrack | null> => {
  try {
    console.log('🎵 Fetching Spotify music from API...');
    
    const response = await fetch('/api/auth/spotify/current');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.warn('🎵 Spotify API error:', errorData.error);
      return null;
    }

    const track = await response.json();
    console.log('🎵 Successfully fetched Spotify track:', track.name, 'by', track.artist);
    
    return track;
  } catch (error) {
    console.error('🎵 Error fetching Spotify music:', error);
    return null;
  }
};

// Function to get multiple recent tracks (client-side)
export const getRecentMusicTracks = async (limit: number = 5): Promise<SpotifyRecentTrack[]> => {
  try {
    console.log(`🎵 Fetching ${limit} recent Spotify tracks from API...`);
    
    const response = await fetch(`/api/auth/spotify/recent?limit=${limit}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.warn('🎵 Spotify recent tracks API error:', errorData.error);
      return [];
    }

    const tracks = await response.json();
    console.log('🎵 Successfully fetched', tracks.length, 'recent Spotify tracks');
    
    return tracks;
  } catch (error) {
    console.error('🎵 Error fetching recent Spotify tracks:', error);
    return [];
  }
};
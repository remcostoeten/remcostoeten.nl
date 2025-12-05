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
    image: '',
    played_at: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    url: 'https://open.spotify.com/track/5yUbyW1MfxqBc0ZkUp1xNG',
    image: '',
    played_at: new Date().toISOString()
  }
];

export const getLatestTracks = async (): Promise<SpotifyTrack[]> => {
  // Check if Spotify credentials are available
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.log('Spotify credentials not found, using mock API data');
    try {
      const response = await fetch('/api/spotify.json');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Using mock Spotify data:', data.tracks.length, 'tracks');
        return data.tracks;
      }
    } catch (error) {
      console.warn('Failed to fetch mock Spotify data:', error);
    }
    return FALLBACK_TRACKS;
  }

  try {
    // First, get access token using client credentials flow with refresh token
    const tokenResponse = await fetch('/api/spotify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!tokenResponse.ok) {
      console.warn('Failed to get Spotify access token:', tokenResponse.status);
      return FALLBACK_TRACKS;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get recently played tracks through proxy
    const recentResponse = await fetch('/api/spotify-recent?limit=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!recentResponse.ok) {
      console.warn('Failed to fetch recent tracks:', recentResponse.status);
      return FALLBACK_TRACKS;
    }

    const recentData = await recentResponse.json();
    
    if (recentData.items && recentData.items.length > 0) {
      const tracks: SpotifyTrack[] = recentData.items.map((item: any) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map((artist: any) => artist.name).join(', '),
        album: item.track.album.name,
        url: item.track.external_urls.spotify,
        image: item.track.album.images[0]?.url || '',
        played_at: item.played_at
      }));

      console.log('✅ Successfully fetched real Spotify tracks:', tracks.length);
      return tracks;
    }
    
    console.log('No recent tracks found, using fallback');
    return FALLBACK_TRACKS;
  } catch (error) {
    console.error('Error fetching Spotify tracks:', error);
    return FALLBACK_TRACKS;
  }
};

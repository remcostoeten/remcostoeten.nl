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
  started_at?: string; // When the current track started playing (calculated)
}

export interface SpotifyRecentTrack {
  name: string;
  artist: string;
  album: string;
  external_url: string;
  image_url?: string;
  played_at: string;
}

// Spotify API Types
interface SpotifyCurrentlyPlayingResponse {
  item: {
    name: string;
    album: {
      name: string;
      external_urls: {
        spotify: string;
      };
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
    };
    artists: Array<{
      name: string;
      external_urls: {
        spotify: string;
      };
    }>;
    external_urls: {
      spotify: string;
    };
    preview_url?: string;
    duration_ms: number;
  } | null;
  is_playing: boolean;
  progress_ms?: number;
}

interface SpotifyRecentTracksResponse {
  items: Array<{
    track: {
      name: string;
      album: {
        name: string;
        external_urls: {
          spotify: string;
        };
        images: Array<{
          url: string;
          height: number;
          width: number;
        }>;
      };
      artists: Array<{
        name: string;
        external_urls: {
          spotify: string;
        };
      }>;
      external_urls: {
        spotify: string;
      };
      preview_url?: string;
      duration_ms: number;
    };
    played_at: string;
  }>;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

// Get Spotify access token using client credentials flow or refresh token
async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify client credentials are not configured');
  }

  // If refresh token is available, use it to get user-specific access
  if (refreshToken) {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Spotify refresh token error: ${response.statusText}`);
    }

    const tokenData: SpotifyTokenResponse = await response.json();
    return tokenData.access_token;
  }

  // Fallback to client credentials flow (limited access)
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Spotify client credentials error: ${response.statusText}`);
  }

  const tokenData: SpotifyTokenResponse = await response.json();
  return tokenData.access_token;
}

// Get the largest image from Spotify's image array
function getLargestImage(images: Array<{ url: string; height: number; width: number }>): string | undefined {
  if (images.length === 0) return undefined;

  // Sort by height and width, return the largest
  const sorted = [...images].sort((a, b) => (b.height * b.width) - (a.height * a.width));
  return sorted[0].url;
}

// Format artist names from array
function formatArtists(artists: Array<{ name: string }>): string {
  return artists.map(artist => artist.name).join(', ');
}

/**
 * Get currently playing track or most recent track if nothing is playing
 */
export async function getCurrentOrRecentMusic(): Promise<SpotifyTrack | SpotifyRecentTrack | null> {
  try {
    const accessToken = await getSpotifyAccessToken();

    // Try to get currently playing track first
    const currentlyPlayingResponse = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (currentlyPlayingResponse.status === 204) {
      // No content - nothing is currently playing, fetch recent tracks
      return await getRecentMusicTracks(1).then(tracks => tracks[0] || null);
    }

    if (!currentlyPlayingResponse.ok) {
      throw new Error(`Spotify currently playing error: ${currentlyPlayingResponse.statusText}`);
    }

    const currentlyPlayingData: SpotifyCurrentlyPlayingResponse = await currentlyPlayingResponse.json();
    const track = currentlyPlayingData.item;

    // If no track is currently playing (item is null), fall back to recent tracks
    if (!track) {
      return await getRecentMusicTracks(1).then(tracks => tracks[0] || null);
    }

    const spotifyTrack: SpotifyTrack = {
      name: track.name,
      artist: formatArtists(track.artists),
      album: track.album.name,
      external_url: track.external_urls.spotify,
      preview_url: track.preview_url,
      image_url: getLargestImage(track.album.images),
      is_playing: currentlyPlayingData.is_playing,
      progress_ms: currentlyPlayingData.progress_ms,
      duration_ms: track.duration_ms,
    };

    // Calculate when the current track started playing
    if (currentlyPlayingData.progress_ms && track.duration_ms) {
      const startedAt = new Date(Date.now() - currentlyPlayingData.progress_ms);
      spotifyTrack.started_at = startedAt.toISOString();
    }

    return spotifyTrack;

  } catch (error) {
    console.error('Error fetching current Spotify track:', error);

    // Fallback to recent tracks if current track fails
    try {
      const recentTracks = await getRecentMusicTracks(1);
      return recentTracks[0] || null;
    } catch (fallbackError) {
      console.error('Error fetching fallback recent tracks:', fallbackError);
      throw new Error(`Failed to fetch Spotify data: ${error.message}`);
    }
  }
}

/**
 * Get recently played tracks
 */
export async function getRecentMusicTracks(limit: number = 10): Promise<SpotifyRecentTrack[]> {
  try {
    const accessToken = await getSpotifyAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify recent tracks error: ${response.statusText}`);
    }

    const data: SpotifyRecentTracksResponse = await response.json();

    return data.items.map(item => ({
      name: item.track.name,
      artist: formatArtists(item.track.artists),
      album: item.track.album.name,
      external_url: item.track.external_urls.spotify,
      image_url: getLargestImage(item.track.album.images),
      played_at: item.played_at,
    }));

  } catch (error) {
    console.error('Error fetching recent Spotify tracks:', error);
    throw new Error(`Failed to fetch recent Spotify tracks: ${error.message}`);
  }
}

/**
 * Helper function to format played_at timestamp with enhanced relative time formatting
 */
export function formatPlayedAtTimestamp(playedAt: string): string {
  const date = new Date(playedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));

  // Just now (less than 30 seconds)
  if (diffSeconds < 30) {
    return 'just now';
  }

  // Less than a minute
  if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  }

  // Minutes formatting
  if (diffMins < 60) {
    if (diffMins === 1) {
      return '1 minute ago';
    } else if (diffMins <= 5) {
      return 'a few minutes ago';
    } else if (diffMins < 20) {
      return `${diffMins} minutes ago`;
    } else {
      return 'about half an hour ago';
    }
  }

  // Hours formatting
  if (diffHours < 24) {
    if (diffHours === 1) {
      return 'an hour ago';
    } else if (diffHours <= 3) {
      return 'a few hours ago';
    } else if (diffHours < 12) {
      return `${diffHours} hours ago`;
    } else {
      return 'earlier today';
    }
  }

  // Days formatting
  if (diffDays < 7) {
    if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays <= 3) {
      return 'a few days ago';
    } else {
      return `${diffDays} days ago`;
    }
  }

  // Weeks formatting
  if (diffWeeks < 4) {
    if (diffWeeks === 1) {
      return 'last week';
    } else if (diffWeeks <= 2) {
      return 'a couple of weeks ago';
    } else {
      return `${diffWeeks} weeks ago`;
    }
  }

  // Months formatting
  if (diffMonths < 12) {
    if (diffMonths === 1) {
      return 'last month';
    } else if (diffMonths <= 3) {
      return 'a few months ago';
    } else {
      return `${diffMonths} months ago`;
    }
  }

  // Years formatting
  if (diffYears === 1) {
    return 'last year';
  } else if (diffYears <= 2) {
    return 'a couple of years ago';
  } else {
    return `${diffYears} years ago`;
  }
}

/**
 * Shorter version of relative time for compact displays
 */
export function formatPlayedAtTimestampShort(playedAt: string): string {
  const date = new Date(playedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));

  if (diffSeconds < 30) return 'now';
  if (diffSeconds < 60) return `${diffSeconds}s`;
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffWeeks < 4) return `${diffWeeks}w`;
  if (diffMonths < 12) return `${diffMonths}mo`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Exact relative time formatter that always returns numeric values (e.g. "5 minutes ago")
 */
export function formatRelativeTimeExact(isoTimestamp: string): string {
  const target = new Date(isoTimestamp);
  if (isNaN(target.getTime())) {
    return '';
  }

  const now = Date.now();
  const diffMs = target.getTime() - now; // negative when in the past
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

  const seconds = Math.round(diffMs / 1000);
  if (Math.abs(seconds) < 60) {
    return seconds === 0 ? 'just now' : formatter.format(seconds, 'second');
  }

  const minutes = Math.round(diffMs / (1000 * 60));
  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute');
  }

  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, 'hour');
  }

  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(days) < 7) {
    return formatter.format(days, 'day');
  }

  const weeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7));
  if (Math.abs(weeks) < 5) {
    return formatter.format(weeks, 'week');
  }

  const months = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
  if (Math.abs(months) < 12) {
    return formatter.format(months, 'month');
  }

  const years = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));
  return formatter.format(years, 'year');
}

/**
 * Format duration in milliseconds to human readable format (mm:ss)
 */
export function formatDuration(durationMs: number): string {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Spotify OAuth Token Cache
 * 
 * Caches the access token in memory to avoid refreshing on every API call.
 * Token is cached for 55 minutes (Spotify tokens expire after 1 hour).
 * 
 * Performance Impact:
 * - Saves ~100-300ms per request by avoiding token refresh roundtrip
 * - Reduces load on Spotify's auth servers
 */

const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';
const TOKEN_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

interface CachedToken {
    accessToken: string;
    expiresAt: number;
}

// Module-level cache (persists across requests in the same process)
let tokenCache: CachedToken | null = null;

/**
 * Get a valid Spotify access token, using cache when possible.
 * Returns null if credentials are not configured or refresh fails.
 */
export async function getSpotifyAccessToken(): Promise<string | null> {
    // Check cache first
    if (tokenCache && Date.now() < tokenCache.expiresAt) {
        return tokenCache.accessToken;
    }

    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // Validate credentials
    if (!refreshToken || refreshToken === 'your_refresh_token_here' || refreshToken.startsWith('#')) {
        return null;
    }

    if (!clientId || !clientSecret) {
        console.error('[Spotify Auth] Missing client credentials');
        return null;
    }

    try {
        const authString = `${clientId}:${clientSecret}`;
        const base64Auth = Buffer.from(authString).toString('base64');

        const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${base64Auth}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            console.error(`[Spotify Auth] Token refresh failed: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.error) {
            console.error('[Spotify Auth] Token error:', data.error);
            return null;
        }

        // Cache the token (expires_in is in seconds, typically 3600)
        const expiresInMs = (data.expires_in || 3600) * 1000;
        tokenCache = {
            accessToken: data.access_token,
            expiresAt: Date.now() + expiresInMs - TOKEN_BUFFER_MS,
        };

        return tokenCache.accessToken;
    } catch (error) {
        console.error('[Spotify Auth] Failed to refresh token:', error);
        return null;
    }
}

/**
 * Invalidate the cached token (useful if you get a 401 from Spotify)
 */
export function invalidateSpotifyTokenCache(): void {
    tokenCache = null;
}

/**
 * Check if credentials are configured
 */
export function hasSpotifyCredentials(): boolean {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    return !!(
        refreshToken &&
        refreshToken !== 'your_refresh_token_here' &&
        !refreshToken.startsWith('#') &&
        process.env.SPOTIFY_CLIENT_ID &&
        process.env.SPOTIFY_CLIENT_SECRET
    );
}

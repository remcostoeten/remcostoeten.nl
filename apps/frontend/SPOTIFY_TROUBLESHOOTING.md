# Spotify Integration Troubleshooting Guide

## Issues Found and Fixed

### 1. Missing Environment Variables
**Problem**: Your `.env` file was missing several required Spotify environment variables.

**Fixed**: Added the following variables to your `.env` file:
```env
SPOTIFY_CLIENT_ID=1bdb7da881754bca926a285a2bd1b40e
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback
SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
```

### 2. Environment Variable Naming
**Problem**: The service was looking for server-side variables that weren't defined.

**Solution**: Your code uses both client-side (`NEXT_PUBLIC_*`) and server-side variables. Make sure both are set:
- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` - for client-side auth URL generation
- `SPOTIFY_CLIENT_ID` - for server-side token exchange
- `SPOTIFY_CLIENT_SECRET` - for server-side token exchange

## Step-by-Step Authentication Process

### Step 1: Verify Environment Variables
Run the debug script to check your configuration:
```bash
npx tsx scripts/test-spotify-auth.ts
```

### Step 2: Start Authentication Flow
1. Visit: `http://127.0.0.1:3000/spotify-auth`
2. Click "Connect Spotify"
3. Complete Spotify authorization
4. You'll be redirected to the setup page with your refresh token

### Step 3: Configure Refresh Token
1. Copy the refresh token from the setup page
2. Replace `SPOTIFY_REFRESH_TOKEN=your_refresh_token_here` in your `.env` file
3. Restart your development server

### Step 4: Test Integration
1. Visit: `http://127.0.0.1:3000/spotify-setup`
2. Click "Test Spotify Integration"
3. You should see your current/recent track

## Common Issues and Solutions

### Issue: "No refresh token configured"
**Cause**: The `SPOTIFY_REFRESH_TOKEN` is not set or still has the default value.
**Solution**: Complete the authentication flow and update your `.env` file.

### Issue: "Invalid client credentials"
**Cause**: Client ID or Client Secret is incorrect.
**Solution**: 
1. Double-check your credentials in the Spotify Developer Dashboard
2. Ensure no extra spaces or characters
3. Verify the credentials are 32 hexadecimal characters each

### Issue: "Invalid redirect URI"
**Cause**: The redirect URI doesn't match what's configured in Spotify.
**Solution**: 
1. In Spotify Developer Dashboard, set redirect URI to: `http://127.0.0.1:3000/api/spotify/callback`
2. Use `127.0.0.1` instead of `localhost` (Spotify requirement)

### Issue: "Authorization code expired"
**Cause**: Too much time passed between authorization and token exchange.
**Solution**: Complete the flow quickly or restart the authentication process.

## Spotify Developer Dashboard Configuration

Make sure your Spotify app is configured with:

1. **App Name**: Your choice
2. **App Description**: Your choice  
3. **Redirect URIs**: `http://127.0.0.1:3000/api/spotify/callback`
4. **APIs Used**: Web API
5. **Scopes**: The app will request these automatically:
   - `user-read-currently-playing`
   - `user-read-recently-played`
   - `user-read-playback-state`

## Testing Your Integration

### Manual API Tests
You can test the API endpoints directly:

1. **Current Track**: `GET http://127.0.0.1:3000/api/spotify/current`
2. **Recent Tracks**: `GET http://127.0.0.1:3000/api/spotify/recent?limit=5`
3. **Token Refresh**: `GET http://127.0.0.1:3000/api/spotify/token`

### Expected Responses

**Success Response** (current track):
```json
{
  "name": "Song Name",
  "artist": "Artist Name",
  "album": "Album Name",
  "external_url": "https://open.spotify.com/track/...",
  "image_url": "https://i.scdn.co/image/...",
  "is_playing": true
}
```

**Error Response**:
```json
{
  "error": "No refresh token configured"
}
```

## Debug Logging

The service includes extensive logging. Check your console for:
- `🔍 Spotify Auth Debug:` - Environment variable status
- `🔗 Generated auth URL:` - Authorization URL
- `🔐 Auth string length:` - Credential validation
- `🎵 Spotify token response:` - Token exchange results

## File Structure

Your Spotify integration consists of:
- `src/services/spotify-service.ts` - Core Spotify API logic
- `src/app/api/spotify/callback/route.ts` - OAuth callback handler
- `src/app/api/spotify/current/route.ts` - Current track API
- `src/app/api/spotify/recent/route.ts` - Recent tracks API
- `src/app/api/spotify/token/route.ts` - Token refresh API
- `src/app/spotify-auth/page.tsx` - Authentication page
- `src/app/spotify-setup/page.tsx` - Setup and testing page

## Next Steps

1. Run the debug script: `npx tsx scripts/test-spotify-auth.ts`
2. If all checks pass, visit `/spotify-auth` to start authentication
3. Complete the flow and update your `.env` file
4. Test the integration at `/spotify-setup`
5. Your Spotify data should now appear on your portfolio

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Check your terminal/server logs for detailed error information
3. Verify your Spotify Developer Dashboard settings
4. Ensure your development server is running on port 3000
5. Try the authentication flow in an incognito/private browser window
# Token Setup Guide

## Issues Fixed

### 1. GitHub Recent Activity
The "working on various projects on GitHub (recently)" message appears because your GitHub token doesn't have the required scopes to access user events.

**Solution:**
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with these scopes:
   - `read:user` - to read user events
   - `repo` - to access repository information
   - `user:email` (optional) - for email access
3. Replace your current token in `.env`:
   ```
   GITHUB_TOKEN=your_new_token_here
   NEXT_PUBLIC_GITHUB_TOKEN=your_new_token_here
   ```

### 2. Spotify Integration
The Spotify integration shows fallback songs because you don't have a valid refresh token.

**Solution:**
1. Make sure your Spotify app is set up at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add `http://127.0.0.1:3000/api/spotify/callback` to your app's redirect URIs
3. Run the token helper script:
   ```bash
   cd apps/frontend
   node get-spotify-token.js
   ```
4. Follow the instructions to get your refresh token
5. Add it to your `.env` file:
   ```
   SPOTIFY_REFRESH_TOKEN=your_actual_refresh_token_here
   ```

## Current Status

- ✅ GitHub token works for basic API calls
- ❌ GitHub token lacks scopes for user events (shows fallback activity)
- ✅ Spotify credentials are configured
- ❌ Spotify refresh token is placeholder (shows fallback songs)

## Testing

After updating the tokens:

1. **GitHub**: The recent activity should show real commit messages and project names
2. **Spotify**: The music section should show your actual currently playing or recently played tracks

## Fallback Behavior

Both services gracefully fall back to realistic placeholder data when the real APIs aren't available, so your site will always look good even during setup.
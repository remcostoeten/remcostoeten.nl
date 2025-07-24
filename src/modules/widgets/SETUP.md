# Spotify Widgets Setup Guide

This guide will walk you through setting up the Spotify widgets in your React application.

## 🔧 Prerequisites

1. **React 18+** with TypeScript
2. **Framer Motion** (already installed)
3. **Tailwind CSS** (already installed)
4. **@remcostoeten/fync** package (already installed)

## 🔑 Spotify API Setup

### Method 1: Quick Setup (For Development)

1. **Get a temporary access token:**
   - Go to [Spotify Web API Console](https://developer.spotify.com/console/get-recently-played/)
   - Click "Get Token" and authorize the required scopes:
     - `user-read-recently-played`
     - `user-read-playback-state` (optional)
   - Copy the generated token

2. **Add to your environment:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add:
   ```bash
   REACT_APP_SPOTIFY_ACCESS_TOKEN=your_temporary_token_here
   ```

⚠️ **Note:** Temporary tokens expire after 1 hour. For production, use Method 2.

### Method 2: OAuth Flow (For Production)

1. **Create a Spotify App:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create an App"
   - Fill in the details and save

2. **Configure your app:**
   - Add redirect URI: `http://localhost:3000/callback` (for development)
   - Note down your Client ID and Client Secret

3. **Set environment variables:**
   ```bash
   REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
   REACT_APP_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```

4. **Implement OAuth flow** (you'll need to create auth components for this)

## 🎛️ Configuration Options

All widgets can be configured via environment variables:

```bash
# Widget refresh rate (how often to fetch new data from Spotify)
REACT_APP_SPOTIFY_WIDGET_REFRESH_INTERVAL=60000  # 1 minute

# Number of recent tracks to fetch
REACT_APP_SPOTIFY_WIDGET_TRACK_LIMIT=5

# How fast tracks cycle in the display
REACT_APP_SPOTIFY_WIDGET_CYCLE_INTERVAL=3000  # 3 seconds
```

## 🚀 Usage

### Basic Usage (with environment defaults)
```tsx
import { ListeningStatusExample } from './modules/widgets';

function App() {
  return (
    <div>
      <ListeningStatusExample />
    </div>
  );
}
```

### Custom Configuration
```tsx
import { ListeningStatus, useRecentTracks } from './modules/widgets';

function MyComponent() {
  const { tracks, loading, error } = useRecentTracks({
    limit: 10,           // Override env default
    refreshInterval: 30000  // Override env default
  });

  if (loading) return <div>Loading music...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ListeningStatus
      prefixText="currently vibing to"
      tracks={tracks}
      interval={2000}  // Override env default
      className="text-center"
    />
  );
}
```

### Demo Mode (no API required)
```tsx
import { ListeningStatusDemo } from './modules/widgets';

function App() {
  return (
    <div>
      <ListeningStatusDemo />
    </div>
  );
}
```

## 🛠️ Troubleshooting

### "Spotify access token not found"
- Make sure your `.env` file contains `REACT_APP_SPOTIFY_ACCESS_TOKEN`
- Restart your development server after adding environment variables
- Check that the token hasn't expired (temporary tokens last 1 hour)

### "Failed to fetch tracks"
- Verify your access token has the correct scopes (`user-read-recently-played`)
- Check your network connection
- Ensure you have recently played tracks in your Spotify account

### Tracks not updating
- Check that `refreshInterval` is set to a value > 0
- Verify your token hasn't expired
- Look for errors in the browser console

### Animation issues
- Ensure Framer Motion is installed: `npm install framer-motion`
- Check that your Tailwind CSS is configured correctly

## 📱 Production Considerations

1. **Token Management:**
   - Implement proper OAuth flow for token refresh
   - Store tokens securely (not in localStorage for sensitive apps)
   - Handle token expiration gracefully

2. **Rate Limiting:**
   - Spotify has rate limits (~100 requests per minute)
   - Don't set refresh intervals too low
   - Implement exponential backoff for failed requests

3. **Error Handling:**
   - Show user-friendly error messages
   - Provide fallback content when API is unavailable
   - Log errors for monitoring

4. **Performance:**
   - Consider caching tracks locally
   - Lazy load the widget if not immediately visible
   - Optimize re-renders with React.memo if needed

## 🎨 Customization

The widgets use Tailwind CSS classes that you can override:

```tsx
<ListeningStatus 
  className="text-lg font-bold text-purple-500 hover:text-purple-600 transition-colors"
  // ... other props
/>
```

Available CSS classes used:
- `text-muted-foreground` - Default text color
- `text-foreground` - Highlighted text (track names)
- `font-medium` - Track name font weight
- `italic` - "no recent tracks" style

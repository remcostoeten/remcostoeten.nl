# Spotify Widgets

A collection of React components for displaying Spotify listening activity using the `@remcostoeten/fync` package.

## Components

### ListeningStatus

A parent component that displays customizable text with a cycling list of recent tracks.

```tsx
import { ListeningStatus } from './modules/widgets';

<ListeningStatus
  prefixText="while listening to" // optional, default: "while listening to"
  tracks={tracks}
  interval={3000} // optional, milliseconds between track changes, default: 3000
  className="max-w-md" // optional, additional CSS classes
  showHoverCard={true} // optional, show detailed track info on hover, default: false
/>
```

### RecentSpotify

A child component that displays cycling recent tracks with smooth animations.

```tsx
import { RecentSpotify } from './modules/widgets';

<RecentSpotify
  tracks={tracks}
  interval={3000} // optional, milliseconds between track changes, default: 3000
  showHoverCard={true} // optional, show detailed track info on hover, default: false
/>
```

### TrackHoverCard

A hover card component that displays detailed track information including album art, duration, release date, and Spotify links.

```tsx
import { TrackHoverCard } from './modules/widgets';

<TrackHoverCard track={track} disabled={false}>
  <span>Hover me for track details!</span>
</TrackHoverCard>
```

**Features:**
- 🎨 Album artwork display
- ⏱️ Track duration and release date
- 🏷️ Explicit content and popularity badges
- 🔗 Direct links to Spotify track and album
- 📅 Relative "played at" timestamps
- 🎵 Preview availability indicator

## Hooks

### useRecentTracks

A custom hook to fetch recent Spotify tracks using the fync package.

```tsx
import { useRecentTracks } from './modules/widgets';

const { tracks, loading, error, refetch } = useRecentTracks({
  limit: 5, // optional, number of tracks to fetch, default: 5
  refreshInterval: 60000 // optional, auto-refresh interval in ms, 0 to disable, default: 0
});
```

## Usage Examples

### With Real Spotify Data

```tsx
import { ListeningStatusExample } from './modules/widgets';

// Uses the useRecentTracks hook internally
<ListeningStatusExample />
```

### With Mock Data (for testing)

```tsx
import { ListeningStatusDemo } from './modules/widgets';

// Uses predefined mock tracks
<ListeningStatusDemo />
```

### Custom Implementation

```tsx
import { ListeningStatus, useRecentTracks } from './modules/widgets';

const MyComponent = () => {
  const { tracks, loading, error } = useRecentTracks({
    limit: 5,
    refreshInterval: 60000
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ListeningStatus
      prefixText="currently vibing to"
      tracks={tracks}
      interval={2000}
      className="text-center"
    />
  );
};
```

## Setup

1. Install the fync package:
```bash
npm install @remcostoeten/fync
```

2. Set up your Spotify access token in your environment variables:
```bash
REACT_APP_SPOTIFY_ACCESS_TOKEN=your_spotify_token_here
```

3. Import and use the components in your React application.

## Features

- ✅ Smooth animations using Framer Motion
- ✅ Customizable text prefix
- ✅ Configurable cycling interval
- ✅ Auto-refresh capability
- ✅ Error handling and loading states
- ✅ TypeScript support
- ✅ Responsive design with Tailwind CSS
- ✅ Rich hover cards with detailed track information
- ✅ Album artwork and metadata display
- ✅ Direct Spotify integration links

## Dependencies

- React 18+
- Framer Motion
- @remcostoeten/fync
- Tailwind CSS (for styling)

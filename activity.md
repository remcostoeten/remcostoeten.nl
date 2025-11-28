# Activity Module Implementation

Implement the missing API services and data layer for the activity module that provides real-time GitHub activity and Spotify music integration to the homepage.

## 🎯 Overview

The activity module (`src/modules/activity/`) displays:
- **GitHub Activity**: Recent commits from your repositories with auto-cycling every 5.95s
- **Spotify Integration**: Currently playing or recent music tracks with playback status

## 📁 Current File Structure

```
src/modules/activity/
├── types.ts                                    # ✅ Type definitions
├── components/
│   ├── activity.tsx                           # ✅ Main component (TLatestActivity)
│   ├── shell.tsx                             # ✅ Layout container
│   ├── github-content.tsx                    # ✅ GitHub display
│   ├── commit-hover-card.tsx                 # ✅ Commit hover popup
│   ├── spotify-integration.tsx               # ✅ Spotify manager
│   ├── spotify-hover-card.tsx                # ✅ Track hover popup
│   └── shopify-content.tsx                   # ✅ Spotify display (rename to spotify-content.tsx)
```

## 🚨 Missing Services

### 1. GitHub Service (`src/services/github-service.ts`)
**Missing Functions**:
```typescript
export interface TLatestActivity {
  latestCommit: string;           // Commit message
  commitUrl: string;             // GitHub commit URL
  project: string;               // Repository name
  repositoryUrl: string;         // Repository URL
  timestamp: string;            // Human-readable timestamp
  branch?: string;               // Optional branch name
  additions?: number;            // Optional line additions
  deletions?: number;            // Optional line deletions
  author?: {                     // Optional author info
    name: string;
    url?: string;
  };
}

export async function fetchLatestActivities(): Promise<{
  activities: TLatestActivity[];
}>;
```

### 2. Spotify Service (`src/services/spotify-service.ts`)
**Missing Functions**:
```typescript
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

export const getCurrentOrRecentMusic = async (): Promise<SpotifyTrack | SpotifyRecentTrack | null>;
export const getRecentMusicTracks = async (limit?: number): Promise<SpotifyRecentTrack[]>;
```

## 🔧 Implementation Tasks

### Task 1: Create GitHub Service
1. **File**: `src/services/github-service.ts`
2. **Implement** `fetchLatestActivities()` function:
   - Use GitHub REST API: `https://api.github.com/users/remcostoeten/events/public`
   - Filter for `PushEvent` events within last month
   - Fetch commit details for each push event
   - Return structured `TLatestActivity[]` array
   - Handle rate limiting and errors gracefully
   - Add proper TypeScript types

3. **API Integration**:
   - Use `NEXT_PUBLIC_GITHUB_TOKEN` or `GITHUB_TOKEN` environment variable
   - Implement proper headers and user agent
   - Add caching strategy (Next.js `unstable_cache`)

### Task 2: Create Spotify Service
1. **File**: `src/services/spotify-service.ts`
2. **Implement** functions:
   - `getCurrentOrRecentMusic()` - Returns current or most recent track
   - `getRecentMusicTracks(limit)` - Returns recent track history
   - OAuth token refresh logic using environment variables
   - Proper error handling and fallbacks

3. **API Integration**:
   - Use Spotify Web API endpoints:
     - `/me/player/currently-playing` for current track
     - `/me/player/recently-played` for recent tracks
   - Handle OAuth refresh tokens via environment variables

### Task 3: Create API Routes
Create Next.js API routes to support client-side calls:

1. **GitHub API Route**: `src/app/api/activity/github/route.ts`
   ```typescript
   import { NextResponse } from 'next/server';
   import { fetchLatestActivities } from '@/services/github-service';

   export async function GET() {
     try {
       const activities = await fetchLatestActivities();
       return NextResponse.json(activities);
     } catch (error) {
       return NextResponse.json(
         { error: 'Failed to fetch GitHub activities' },
         { status: 500 }
       );
     }
   }
   ```

2. **Spotify API Routes**:
   - `src/app/api/activity/spotify/current/route.ts` - Current track
   - `src/app/api/activity/spotify/recent/route.ts` - Recent tracks

### Task 4: Update Activity Components
1. **File**: `src/modules/activity/components/activity.tsx`
   - Update `fetchLatestActivities()` import to use the new API route: `fetch('/api/activity/github')`
   - Add proper error handling and loading states

2. **File**: `src/modules/activity/components/spotify-integration.tsx`
   - Update Spotify API calls to use new API routes: `fetch('/api/activity/spotify/current')`
   - Ensure proper error handling

3. **File Rename**: `src/modules/activity/components/shopify-content.tsx` → `spotify-content.tsx`
   - Update imports in spotify-integration.tsx

### Task 5: Environment Variables
Create/update `.env.local` with required variables:

```env
# GitHub API (optional, for higher rate limits)
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Spotify API (required for music integration)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

## 🎨 Expected UI Behavior

### GitHub Activity
- Displays recent commits in auto-cycling carousel (5.95s intervals)
- Shows: commit message, repository name, timestamp, commit URL
- Hover shows detailed commit popup with branch, stats, author
- Pause on hover, resume on mouse leave
- Loading state shows skeleton, error shows retry button

### Spotify Activity
- Shows currently playing track or recent music
- Displays: track name, artist, album, album art
- Currently playing tracks show progress bar and playback animation
- Hover shows detailed track popup with duration, played_at timestamp
- Auto-cycles through recent tracks every 5.95s
- Pause on hover, smooth transitions between tracks

## 🔗 Integration Points

### Homepage Integration
The activity module should be added to the homepage layout:

```typescript
// src/app/page.tsx
import { LatestActivity } from '@/modules/activity/components/activity';

export default function HomePage() {
  return (
    <div>
      {/* existing homepage content */}

      {/* Activity Section */}
      <section className="py-8">
        <LatestActivity />
      </section>
    </div>
  );
}
```

### Styling Requirements
- Use Tailwind CSS classes consistent with existing design system
- Dark/light mode support
- Responsive design for mobile/desktop
- Smooth animations using Framer Motion
- Zero layout shift (fixed height containers)

## 🚀 Performance Considerations

1. **Caching**: Use Next.js `unstable_cache` for GitHub API (1 hour cache)
2. **Error Boundaries**: Wrap components in error boundaries
3. **Loading States**: Show skeleton UI during data fetching
4. **Optimistic UI**: Update UI immediately, rollback on error
5. **Rate Limiting**: Respect GitHub and Spotify API rate limits

## ✅ Success Criteria

- [ ] GitHub activity displays recent commits with proper formatting
- [ ] Spotify integration shows current/recent music with album art
- [ ] Auto-cycling works for both activities (5.95s intervals)
- [ ] Hover interactions show detailed popups
- [ ] Loading and error states are handled gracefully
- [ ] Environment variables are properly configured
- [ ] API routes respond correctly with proper error handling
- [ ] Zero layout shift, responsive design
- [ ] Activity module integrates seamlessly into homepage

## 🔍 Testing Checklist

- [ ] Test GitHub API token authentication
- [ ] Test Spotify OAuth flow and token refresh
- [ ] Verify error handling for failed API calls
- [ ] Test responsive design on mobile devices
- [ ] Verify accessibility (ARIA labels, keyboard navigation)
- [ ] Test auto-cycling pause/resume on hover
- [ ] Verify dark/light mode compatibility

This implementation will bring the activity module to life with real-time GitHub and Spotify data displayed in an elegant, auto-cycling interface on your homepage.
import { GitCommit, Music, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ServerActivitySkeleton - Server-side renderable activity skeleton
 * 
 * Features:
 * - Renders exact same layout dimensions as the real component
 * - Server-side renderable (no client JavaScript required)
 * - All icons, static text, and layout structure rendered immediately
 * - Only dynamic content (commits, songs, timestamps) are skeleton placeholders
 */

type TProps = {
  className?: string;
};

export function ServerActivitySkeleton({ className }: TProps) {
  return (
    <section
      className={cn(
        'p-4 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm relative min-h-[140px] xs:min-h-[120px]',
        className
      )}
      aria-labelledby="latest-activity-heading"
      style={{ zIndex: 1 }}
    >
      <h2 id="latest-activity-heading" className="sr-only">Latest Development Activity</h2>

      {/* GitHub Activity Section - Server Rendered Structure */}
      <div className="flex items-start gap-3 mb-4">
        {/* Icon - Rendered on Server */}
        <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0" aria-hidden="true">
          <GitCommit className="w-4 h-4 text-accent" />
        </div>

        {/* Content Area - Fixed Dimensions */}
        <div className="leading-tight min-w-0 flex-1 text-body" role="status" aria-live="polite" aria-atomic="true">
          <div className="text-muted-foreground">
            <div className="flex-1 min-w-0 transition-all duration-300 ease-out relative group">
              {/* First Line - Static text + Dynamic commit message */}
              <div className="text-body text-muted-foreground leading-tight mb-2 line-clamp-2">
                <span className="inline">The latest thing I've done is </span>
                {/* Skeleton for commit message - matches exact dimensions */}
                <span className="inline-block">
                  <span className="h-5 bg-muted/60 rounded-md animate-pulse w-[280px] max-w-[calc(100vw-120px)] inline-block align-middle"></span>
                </span>
              </div>

              {/* Second Line - Static text + Dynamic project + timestamp */}
              <div className="text-sm text-muted-foreground leading-tight flex flex-wrap items-baseline gap-1">
                <span className="whitespace-nowrap">on</span>
                {/* Skeleton for project name */}
                <span className="inline-block">
                  <span className="h-4 bg-muted/40 rounded-md animate-pulse w-[120px] max-w-[200px] inline-block align-middle"></span>
                </span>
                {/* Skeleton for timestamp */}
                <span className="inline-flex items-center text-muted-foreground whitespace-nowrap">
                  (<span className="h-4 bg-muted/40 rounded-md animate-pulse w-[60px] inline-block align-middle"></span>)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spotify Activity Section - Server Rendered Structure */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
        <h3 className="sr-only">Music Activity</h3>
        
        {/* Icon - Rendered on Server */}
        <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0">
          <Music className="w-4 h-4 text-green-500" aria-hidden="true" />
        </div>

        {/* Content Area - Fixed Dimensions */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-out">
          <div className="flex items-start gap-3">
            {/* Text content - two lines matching the real component */}
            <div className="flex-1 min-w-0">
              {/* First line - Static text + dynamic track and artist */}
              <div className="text-body text-muted-foreground leading-tight mb-2">
                <span className="flex-shrink-0">Recently played </span>
                {/* Skeleton for track name */}
                <span className="inline-block font-semibold text-foreground">
                  <span className="h-5 bg-muted/60 rounded-md animate-pulse w-[160px] max-w-[250px] inline-block align-middle"></span>
                </span>
                <span className="flex-shrink-0"> by </span>
                {/* Skeleton for artist name */}
                <span className="inline-block font-medium text-foreground">
                  <span className="h-5 bg-muted/60 rounded-md animate-pulse w-[120px] max-w-[180px] inline-block align-middle"></span>
                </span>
              </div>

              {/* Second line - Static text + dynamic album and timestamp */}
              <div className="text-sm text-muted-foreground leading-tight">
                <span className="flex-shrink-0">from</span>
                {/* Skeleton for album name */}
                <span className="inline-block ml-1 italic">
                  <span className="h-4 bg-muted/40 rounded-md animate-pulse w-[140px] max-w-[200px] inline-block align-middle"></span>
                </span>
                {/* Skeleton for timestamp */}
                <span className="inline-block ml-2 text-muted-foreground">
                  (<span className="h-4 bg-muted/40 rounded-md animate-pulse w-[50px] inline-block align-middle"></span>)
                </span>
              </div>
            </div>

            {/* Right side - album cover skeleton */}
            <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * GitHubActivitySkeleton - Isolated GitHub activity skeleton
 * Can be used when only the GitHub section is loading
 */
export function GitHubActivitySkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0" aria-hidden="true">
        <GitCommit className="w-4 h-4 text-accent" />
      </div>

      <div className="leading-tight min-w-0 flex-1 text-body" role="status" aria-live="polite" aria-atomic="true">
        <div className="text-muted-foreground">
          <div className="flex-1 min-w-0 transition-all duration-300 ease-out relative group">
            <div className="text-body text-muted-foreground leading-tight mb-2 line-clamp-2">
              <span className="inline">The latest thing I've done is </span>
              <span className="inline-block">
                <span className="h-5 bg-muted/60 rounded-md animate-pulse w-[280px] max-w-[calc(100vw-120px)] inline-block align-middle"></span>
              </span>
            </div>

            <div className="text-sm text-muted-foreground leading-tight flex flex-wrap items-baseline gap-1">
              <span className="whitespace-nowrap">on</span>
              <span className="inline-block">
                <span className="h-4 bg-muted/40 rounded-md animate-pulse w-[120px] max-w-[200px] inline-block align-middle"></span>
              </span>
              <span className="inline-flex items-center text-muted-foreground whitespace-nowrap">
                (<span className="h-4 bg-muted/40 rounded-md animate-pulse w-[60px] inline-block align-middle"></span>)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SpotifyActivitySkeleton - Isolated Spotify activity skeleton
 * Can be used when only the Spotify section is loading
 */
export function SpotifyActivitySkeleton({ showCurrentlyPlaying = false }: { showCurrentlyPlaying?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0">
        {showCurrentlyPlaying ? (
          <Play className="w-4 h-4 text-green-500" aria-hidden="true" />
        ) : (
          <Music className="w-4 h-4 text-green-500" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0 transition-all duration-300 ease-out">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-body text-muted-foreground leading-tight mb-2">
              <span className="flex-shrink-0">
                {showCurrentlyPlaying ? 'Currently listening to' : 'Recently played'}{" "}
              </span>
              <span className="inline-block font-semibold text-foreground">
                <span className="h-5 bg-muted/60 rounded-md animate-pulse w-[160px] max-w-[250px] inline-block align-middle"></span>
              </span>
              <span className="flex-shrink-0"> by </span>
              <span className="inline-block font-medium text-foreground">
                <span className="h-5 bg-muted/60 rounded-md animate-pulse w-[120px] max-w-[180px] inline-block align-middle"></span>
              </span>
            </div>

            <div className="text-sm text-muted-foreground leading-tight">
              <span className="flex-shrink-0">from</span>
              <span className="inline-block ml-1 italic">
                <span className="h-4 bg-muted/40 rounded-md animate-pulse w-[140px] max-w-[200px] inline-block align-middle"></span>
              </span>
              <span className="inline-block ml-2 text-muted-foreground">
                (<span className="h-4 bg-muted/40 rounded-md animate-pulse w-[50px] inline-block align-middle"></span>)
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
}
import { ReactNode } from 'react';
import { GitCommit, Music, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ActivityShell - Server-renderable shell that provides the layout structure
 * 
 * This component renders all static elements (icons, layout, borders) on the server
 * while providing slots for client-hydrated content. This ensures zero layout shift
 * since the complete structure is available immediately.
 */

type TProps = {
  className?: string;
  githubContent?: ReactNode;
  spotifyContent?: ReactNode;
  isSpotifyCurrentlyPlaying?: boolean;
};

export function ActivityShell({
  className,
  githubContent,
  spotifyContent,
  isSpotifyCurrentlyPlaying = false
}: TProps) {
  return (
    <section
      className={cn(
        'p-4 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm relative',
        className
      )}
      aria-labelledby="latest-activity-heading"
      style={{ zIndex: 1 }}
    >
      <h2 id="latest-activity-heading" className="sr-only">Latest Development Activity</h2>

      {/* Use CSS Grid for perfect 1:1 height alignment */}
      <div className="grid grid-rows-2 gap-4">
        {/* GitHub Activity Row - Fixed height */}
        <div className="flex items-center gap-3 min-h-[4rem]">
          <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0" aria-hidden="true">
            <GitCommit className="w-4 h-4 text-accent" />
          </div>

          <div className="leading-tight min-w-0 flex-1 text-body" role="status" aria-live="polite" aria-atomic="true">
            <div className="text-muted-foreground">
              {githubContent}
            </div>
          </div>
        </div>

        {/* Spotify Activity Row - Fixed height with divider */}
        <div className="flex items-center gap-3 min-h-[4rem] pt-4 border-t border-border/30">
          <h3 className="sr-only">Music Activity</h3>

          <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0">
            {isSpotifyCurrentlyPlaying ? (
              <Play className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <Music className="w-4 h-4 text-green-500" aria-hidden="true" />
            )}
          </div>

          {/* Content slot - container with consistent height */}
          <div className="flex-1 min-w-0 transition-all duration-300 ease-out">
            {spotifyContent}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * GitHubActivityShell - Isolated shell for GitHub activity only
 */
type TGitHubActivityShellProps = {
  className?: string;
  children: ReactNode;
};

export function GitHubActivityShell({ className, children }: TGitHubActivityShellProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0" aria-hidden="true">
        <GitCommit className="w-4 h-4 text-accent" />
      </div>

      <div className="leading-tight min-w-0 flex-1 text-body" role="status" aria-live="polite" aria-atomic="true">
        <div className="text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * SpotifyActivityShell - Isolated shell for Spotify activity only
 */
type TSpotifyActivityShellProps = {
  className?: string;
  children: ReactNode;
  isCurrentlyPlaying?: boolean;
};

export function SpotifyActivityShell({ 
  className, 
  children, 
  isCurrentlyPlaying = false 
}: TSpotifyActivityShellProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0">
        {isCurrentlyPlaying ? (
          <Play className="w-4 h-4 text-green-500" aria-hidden="true" />
        ) : (
          <Music className="w-4 h-4 text-green-500" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0 transition-all duration-300 ease-out">
        {children}
      </div>
    </div>
  );
}

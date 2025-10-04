import { GitCommit, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * LatestActivitySkeleton - 1:1 skeleton loader for LatestActivity component
 * 
 * Features:
 * - Server-side renderable (no client-side JavaScript required)
 * - Zero layout shift - matches exact dimensions of real component
 * - Renders instantly on page load
 * - Includes both Git activity and Spotify sections
 * 
 * Usage:
 * 
 * 1. Direct usage in client components:
 *    if (loading) return <LatestActivitySkeleton />;
 * 
 * 2. With Suspense boundary (recommended for SSR):
 *    <Suspense fallback={<LatestActivitySkeleton />}>
 *      <LatestActivity />
 *    </Suspense>
 * 
 * 3. In loading.tsx files:
 *    export default function Loading() {
 *      return <LatestActivitySkeleton />;
 *    }
 */

type TProps = {
  className?: string;
};

export function LatestActivitySkeleton({ className }: TProps) {
  return (
    <section
      className={cn(
        'p-3 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm relative overflow-hidden min-h-[140px] xs:min-h-[120px]',
        className
      )}
      aria-label="Loading activity"
    >
      <div className="flex items-start gap-2 xs:gap-3 mb-3">
        <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0 animate-pulse">
          <GitCommit className="w-4 h-4 text-accent" />
        </div>

        <div className="leading-relaxed min-w-0 flex-1 text-body">
          <div className="text-muted-foreground">
            <div className="space-y-1">
              <div className="h-5 bg-muted/60 rounded-md animate-pulse w-full max-w-[320px] xs:max-w-[380px]"></div>
              <div className="h-5 bg-muted/40 rounded-md animate-pulse w-full max-w-[200px] xs:max-w-[240px]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 xs:gap-3 mt-3 pt-3 border-t border-border/30">
        <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0 animate-pulse">
          <Music className="w-4 h-4 text-green-500" />
        </div>

        <div className="flex items-start gap-3 flex-1">
          <div className="flex-1 min-w-0">
            <div className="text-body text-muted-foreground leading-tight mb-1 flex items-center gap-2">
              <div className="h-5 bg-muted/60 rounded-md animate-pulse w-full max-w-[120px] xs:max-w-[150px]"></div>
              <div className="h-5 bg-muted/50 rounded-md animate-pulse w-6 flex-shrink-0"></div>
              <div className="h-5 bg-muted/60 rounded-md animate-pulse w-full max-w-[100px] xs:max-w-[120px]"></div>
            </div>
            <div className="text-sm text-muted-foreground leading-tight">
              <div className="h-4 bg-muted/40 rounded-md animate-pulse w-full max-w-[180px] xs:max-w-[220px] inline-block"></div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"></div>
        </div>
      </div>
    </section>
  );
}

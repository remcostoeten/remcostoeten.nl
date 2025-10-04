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
      <div className="flex items-start mb-3">
        <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0 animate-pulse mr-2">
          <GitCommit className="w-4 h-4 text-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <div className="h-5 bg-muted/60 rounded-md animate-pulse w-full max-w-[280px] xs:max-w-[320px]"></div>
          </div>
          <div className="h-4 bg-muted/40 rounded-md animate-pulse w-full max-w-[160px] xs:max-w-[200px] mb-3"></div>
        </div>
      </div>

      <div className="border-t border-border/30 mb-3"></div>

      <div className="flex items-center">
        <div className="p-1.5 bg-green-500/10 rounded-lg flex-shrink-0 animate-pulse mr-2">
          <Music className="w-4 h-4 text-green-500" />
        </div>

        <div className="flex-1 min-w-0 mr-2">
          <div className="mb-1">
            <div className="h-5 bg-muted/60 rounded-md animate-pulse w-full max-w-[240px] xs:max-w-[280px]"></div>
          </div>
          <div className="h-4 bg-muted/40 rounded-md animate-pulse w-full max-w-[140px] xs:max-w-[180px]"></div>
        </div>

        <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse flex-shrink-0"></div>
      </div>
    </section>
  );
}

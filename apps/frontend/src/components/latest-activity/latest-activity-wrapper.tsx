import { Suspense } from 'react';
import { LatestActivity } from './index';
import { ServerActivitySkeleton } from './server-skeleton';

/**
 * LatestActivityWrapper - Server-side renderable wrapper with enhanced skeleton
 * 
 * Uses the new ServerActivitySkeleton which provides exact layout dimensions
 * and renders all static content (icons, labels, structure) immediately on the server.
 * This ensures zero layout shift when the component hydrates.
 */

export function LatestActivityWrapper() {
  return (
    <Suspense fallback={<ServerActivitySkeleton />}>
      <LatestActivity />
    </Suspense>
  );
}

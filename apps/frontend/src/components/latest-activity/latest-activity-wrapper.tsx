import { Suspense } from 'react';
import { LatestActivity } from './index';
import { LatestActivitySkeleton } from '../latest-activity-skeleton';

export function LatestActivityWrapper() {
  return (
    <Suspense fallback={<LatestActivitySkeleton />}>
      <LatestActivity />
    </Suspense>
  );
}

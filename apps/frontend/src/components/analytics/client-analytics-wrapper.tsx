'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Further defensive dynamic loading
const AnalyticsTracker = dynamic(
  () => import('./analytics-tracker').then(mod => ({ default: mod.AnalyticsTracker })),
  {
    ssr: false,
    loading: () => null
  }
);

export function ClientAnalyticsWrapper() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient || typeof window === 'undefined') {
    return null;
  }
  
  return <AnalyticsTracker />;
}

'use client';

import { useState } from 'react';
import { ViewCounter } from './ViewCounter';
import { ViewAnalytics } from './ViewAnalytics';
import { useViewCount } from '@/hooks/use-view-count';
import { useMultipleViewCounts } from '@/hooks/use-multiple-view-counts';
import { clearSession } from '@/lib/session';

export function BlogViewsTest() {
  const [testSlug, setTestSlug] = useState('test-post-1');
  const [testSlugs, setTestSlugs] = useState(['test-post-1', 'test-post-2', 'test-post-3']);
  
  const { viewCount, loading, recordView, formattedViewCount } = useViewCount(testSlug, {
    autoIncrement: false
  });
  
  const { getViewCount, getFormattedViewCount, loading: multiLoading } = useMultipleViewCounts(testSlugs);

  const handleManualRecord = async () => {
    const result = await recordView();
    console.log('Manual record result:', result);
  };

  const handleClearSession = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
      <h2 className="text-xl font-semibold">Blog Views Test</h2>
      
      {/* Single View Counter Test */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Single View Counter</h3>
        
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={testSlug}
            onChange={(e) => setTestSlug(e.target.value)}
            className="px-3 py-2 border border-border rounded bg-background text-foreground"
            placeholder="Enter test slug"
          />
          <button
            onClick={handleManualRecord}
            disabled={loading}
            className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Record View'}
          </button>
        </div>
        
        <div className="space-y-2">
          <p>Current count: {loading ? 'Loading...' : `${viewCount} views`}</p>
          <p>Formatted: {formattedViewCount}</p>
          
          <div className="flex gap-4">
            <ViewCounter slug={testSlug} autoIncrement={false} showIcon={true} />
            <ViewCounter 
              slug={`${testSlug}-auto`} 
              autoIncrement={true} 
              incrementDelay={1000}
              className="text-sm text-accent flex items-center gap-1"
            />
          </div>
        </div>
      </div>

      {/* Multiple View Counters Test */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Multiple View Counters</h3>
        
        <div className="space-y-2">
          {testSlugs.map(slug => (
            <div key={slug} className="flex justify-between items-center p-2 bg-muted rounded">
              <span>{slug}</span>
              <span>
                {multiLoading ? 'Loading...' : getFormattedViewCount(slug)}
              </span>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setTestSlugs([...testSlugs, `test-post-${testSlugs.length + 1}`])}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          Add Test Post
        </button>
      </div>

      {/* Session Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Session Management</h3>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Views are tracked per browser session. Refreshing the page won't increment the count,
            but clearing the session will allow new views to be recorded.
          </p>
          
          <button
            onClick={handleClearSession}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Clear Session & Reload
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Analytics</h3>
        <ViewAnalytics />
      </div>
    </div>
  );
}
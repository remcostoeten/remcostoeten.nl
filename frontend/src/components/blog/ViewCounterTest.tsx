'use client';

import { useState } from 'react';
import { ViewCounter } from './ViewCounter';

export function ViewCounterTest() {
  const [testSlug, setTestSlug] = useState('test-post');

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="font-semibold mb-4">View Counter Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Slug:</label>
          <input
            type="text"
            value={testSlug}
            onChange={(e) => setTestSlug(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
            placeholder="Enter a test slug"
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">View Counter (no auto-increment):</p>
          <ViewCounter 
            slug={testSlug} 
            autoIncrement={false}
            className="text-sm flex items-center gap-2 p-2 bg-muted rounded"
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">View Counter (with auto-increment):</p>
          <ViewCounter 
            slug={`${testSlug}-auto`} 
            autoIncrement={true}
            incrementDelay={1000}
            className="text-sm flex items-center gap-2 p-2 bg-accent/10 rounded"
          />
        </div>
      </div>
    </div>
  );
}
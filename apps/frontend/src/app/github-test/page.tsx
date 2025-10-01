'use client';

import { useState, useEffect } from 'react';
import { fetchLatestActivities, LatestActivity } from '@/services/github-service';

export default function GitHubTestPage() {
  const [activities, setActivities] = useState<LatestActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchLatestActivities();
        setActivities(result.activities);
        console.log('GitHub Activities:', result);
      } catch (err) {
        console.error('Error loading activities:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">GitHub Integration Test</h1>
      
      {loading && (
        <div className="text-muted-foreground">Loading GitHub activities...</div>
      )}
      
      {error && (
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {!loading && !error && activities.length === 0 && (
        <div className="text-muted-foreground">No activities found.</div>
      )}
      
      {!loading && !error && activities.length > 0 && (
        <div className="space-y-4">
          <div className="text-green-600 bg-green-50 p-4 rounded-lg">
            <strong>Success!</strong> Found {activities.length} recent activities.
          </div>
          
          {activities.map((activity, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="font-semibold text-lg">{activity.project}</div>
              <div className="text-muted-foreground text-sm mb-2">{activity.timestamp}</div>
              <div className="text-foreground">{activity.latestCommit}</div>
              <div className="mt-2 space-x-4">
                <a 
                  href={activity.commitUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm"
                >
                  View Commit
                </a>
                <a 
                  href={activity.repositoryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm"
                >
                  View Repository
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h2 className="font-semibold mb-2">Environment Check:</h2>
        <div className="text-sm space-y-1">
          <div>GitHub Token: {process.env.NEXT_PUBLIC_GITHUB_TOKEN ? '✅ Set' : '❌ Not set'}</div>
          <div>Token Length: {process.env.NEXT_PUBLIC_GITHUB_TOKEN?.length || 0} characters</div>
        </div>
      </div>
    </div>
  );
}
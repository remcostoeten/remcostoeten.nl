'use client';

import { useState } from 'react';
import { fetchRepositoryData } from '@/services/github-service';

export function DebugHoverCardTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔄 Testing fetchRepositoryData function...');
      const data = await fetchRepositoryData('remcostoeten', 'fync');
      console.log('✅ Success:', data);
      setResult(data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[999999] bg-white dark:bg-gray-900 border p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="font-bold mb-2">Debug Hover Card Test</h3>
      
      <button
        onClick={testFetch}
        disabled={loading}
        className="bg-blue-500 text-white px-3 py-1 rounded mb-3 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test fetchRepositoryData'}
      </button>

      {error && (
        <div className="text-red-500 text-sm mb-2">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="text-sm space-y-1">
          <div><strong>Title:</strong> {result.title}</div>
          <div><strong>Description:</strong> {result.description}</div>
          <div><strong>Stars:</strong> {result.stars}</div>
          <div><strong>Language:</strong> {result.language}</div>
          <div><strong>Contributors:</strong> {result.contributors}</div>
          <div><strong>Total Commits:</strong> {result.totalCommits}</div>
        </div>
      )}
    </div>
  );
}
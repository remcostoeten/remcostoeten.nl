'use client';

import { useState } from 'react';
import { API, apiFetch, getApiConfig } from '@/config/api.config';

export function TestConnection() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const config = getApiConfig();
    
    const tests = [
      {
        name: 'Health Check',
        test: () => apiFetch(API.health())
      },
      {
        name: 'Blog Metadata List',
        test: () => apiFetch(API.blog.metadata.list())
      },
      {
        name: 'Record Test View',
        test: () => apiFetch(API.blog.analytics.increment('test-post'), {
          method: 'POST'
        })
      },
      {
        name: 'Get Test Analytics',
        test: () => apiFetch(API.blog.analytics.get('test-post'))
      }
    ];

    const testResults: any = { config };
    
    for (const { name, test } of tests) {
      try {
        const result = await test();
        testResults[name] = result;
      } catch (error) {
        testResults[name] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <button
        onClick={testEndpoints}
        disabled={loading}
        className="px-4 py-2 bg-accent text-accent-foreground rounded hover:opacity-90 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <div className="text-sm">
            <strong>API Config:</strong>
            <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(results.config, null, 2)}
            </pre>
          </div>
          
          {Object.entries(results).filter(([key]) => key !== 'config').map(([name, result]) => (
            <div key={name} className="text-sm">
              <strong>{name}:</strong>
              <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
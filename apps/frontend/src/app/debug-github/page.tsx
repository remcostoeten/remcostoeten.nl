'use client';

import { useState } from 'react';
import { fetchSpecificFeaturedProjects } from '@/services/github-service';

export default function DebugGithubPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Override console methods to capture logs
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const captureConsole = () => {
    console.log = (...args) => {
      setLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
      originalLog(...args);
    };
    console.error = (...args) => {
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
      originalError(...args);
    };
    console.warn = (...args) => {
      setLogs(prev => [...prev, `WARN: ${args.join(' ')}`]);
      originalWarn(...args);
    };
  };

  const restoreConsole = () => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  };

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLogs([]);

    captureConsole();

    try {
      console.log('🔄 Starting fetchSpecificFeaturedProjects test in browser...');
      const data = await fetchSpecificFeaturedProjects();
      console.log('✅ Success:', data);
      setResult(data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
      restoreConsole();
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Debug GitHub API</h1>
          <button
            onClick={testFetch}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test fetchSpecificFeaturedProjects'}
          </button>
          <button
            onClick={clearLogs}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear Logs
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Console Logs */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-bold mb-3">Console Logs</h3>
            <div className="bg-muted rounded p-3 h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No logs yet...</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-bold mb-3">Results</h3>
            <div className="bg-muted rounded p-3 h-64 overflow-y-auto">
              {loading && <p>Loading...</p>}
              {result && (
                <div className="space-y-2">
                  <p><strong>Total Projects:</strong> {result.length}</p>
                  {result.map((project: any, index: number) => (
                    <div key={index} className="border-b pb-2">
                      <p><strong>{project.title}</strong> ({project.category})</p>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <p className="text-sm">⭐ {project.stars} | 🍴 {project.forks} | 📝 {project.language}</p>
                    </div>
                  ))}
                </div>
              )}
              {!loading && !result && !error && (
                <p className="text-muted-foreground">Click "Test" to run the function...</p>
              )}
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-bold mb-3">Environment Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>GitHub Token:</strong> {process.env.NEXT_PUBLIC_GITHUB_TOKEN ? 'Present' : 'Missing'}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
            </div>
            <div>
              <p><strong>Location:</strong> {window.location.href}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
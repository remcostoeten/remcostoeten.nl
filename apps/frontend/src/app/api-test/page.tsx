'use client';

import { useState, useEffect } from 'react';
import { API, getApiConfig, apiFetch } from '@/config/api.config';
import { useVisitorTracking } from '@/hooks/use-visitor-tracking';

export default function ApiTestPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<ReturnType<typeof getApiConfig> | null>(null);
  
  const visitorTracking = useVisitorTracking();

  useEffect(() => {
    setApiConfig(getApiConfig());
  }, []);

  async function testHealthEndpoint() {
    setLoading(true);
    try {
      const result = await apiFetch(API.health());
      setHealthStatus(result);
    } catch (error) {
      setHealthStatus({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  }

  async function testVisitorStats() {
    setLoading(true);
    try {
      const stats = await visitorTracking.getVisitorStats();
      setVisitorStats(stats);
    } catch (error) {
      setVisitorStats({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  }

  async function trackTestVisit() {
    setLoading(true);
    try {
      const result = await visitorTracking.trackVisitor();
      alert('Visitor tracked successfully! Check console for details.');
      console.log('Track visitor result:', result);
    } catch (error) {
      alert('Failed to track visitor. Check console for details.');
      console.error('Track visitor error:', error);
    }
    setLoading(false);
  }

  if (!apiConfig) return <div>Loading configuration...</div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">API Integration Test Page</h1>
      
      {/* Current Configuration */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Environment:</strong> {apiConfig.environment}</p>
          <p><strong>Base URL:</strong> {apiConfig.base}</p>
          <p><strong>Analytics URL:</strong> {apiConfig.analytics}</p>
          <p className="text-muted-foreground text-xs mt-2">
            Tip: Add ?api=production or ?api=local to the URL to switch environments
          </p>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Tests</h2>
        <div className="space-x-4">
          <button
            onClick={testHealthEndpoint}
            disabled={loading}
            className="px-4 py-2 bg-accent text-background rounded hover:opacity-90 disabled:opacity-50"
          >
            Test Health Endpoint
          </button>
          <button
            onClick={testVisitorStats}
            disabled={loading}
            className="px-4 py-2 bg-accent text-background rounded hover:opacity-90 disabled:opacity-50"
          >
            Get Visitor Stats
          </button>
          <button
            onClick={trackTestVisit}
            disabled={loading}
            className="px-4 py-2 bg-accent text-background rounded hover:opacity-90 disabled:opacity-50"
          >
            Track Test Visit
          </button>
        </div>
      </div>

      {/* Results */}
      {healthStatus && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Health Check Result:</h3>
          <pre className="bg-background p-4 rounded overflow-x-auto text-xs">
            {JSON.stringify(healthStatus, null, 2)}
          </pre>
        </div>
      )}

      {visitorStats && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Visitor Stats:</h3>
          <pre className="bg-background p-4 rounded overflow-x-auto text-xs">
            {JSON.stringify(visitorStats, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">How to Use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>The API environment switcher is in the bottom-right corner</li>
          <li>Switch between Local and Production to test different endpoints</li>
          <li>Use the test buttons above to verify connectivity</li>
          <li>Check the browser console for detailed logs</li>
          <li>The indicator in the bottom-left shows the current API environment</li>
        </ol>
      </div>
    </div>
  );
}
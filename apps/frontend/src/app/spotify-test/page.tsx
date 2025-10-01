'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SpotifyTestPage() {
  const [testResult, setTestResult] = useState<string>('');

  const testRedirectUri = (uri: string) => {
    const clientId = '1bdb7da881754bca926a285a2bd1b40e';
    const scopes = 'user-read-currently-playing user-read-recently-played user-read-playback-state';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: uri,
      show_dialog: 'true'
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    
    setTestResult(`Testing with: ${uri}\nURL: ${authUrl}`);
    
    // Open in new tab
    window.open(authUrl, '_blank');
  };

  const testUris = [
    'http://127.0.0.1:3000/api/spotify/callback',
    'http://localhost:3000/api/spotify/callback',
    'http://127.0.0.1:3000/api/spotify/callback/'
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Spotify Redirect URI Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Test Different Redirect URIs:</h3>
            {testUris.map((uri, index) => (
              <Button
                key={index}
                onClick={() => testRedirectUri(uri)}
                variant="outline"
                className="w-full justify-start"
              >
                Test: {uri}
              </Button>
            ))}
          </div>
          
          {testResult && (
            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Before Testing:
            </h4>
            <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>1. Add ALL three URIs above to your Spotify app settings</li>
              <li>2. Save the settings and wait 2-3 minutes</li>
              <li>3. Try each test button above</li>
              <li>4. Use the one that works!</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
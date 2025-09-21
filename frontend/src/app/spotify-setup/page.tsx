'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, CheckCircle, Music, ExternalLink } from 'lucide-react';

export default function SpotifySetupPage() {
  const searchParams = useSearchParams();
  const [refreshToken, setRefreshToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const token = searchParams.get('refresh_token');
    if (token) {
      setRefreshToken(token);
    }
  }, [searchParams]);

  const copyToken = async () => {
    if (refreshToken) {
      await navigator.clipboard.writeText(refreshToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const testSpotifyAPI = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/spotify/current');
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ success: true, data });
      } else {
        setTestResult({ success: false, error: data.error });
      }
    } catch (error) {
      setTestResult({ success: false, error: 'Network error' });
    } finally {
      setTesting(false);
    }
  };

  const goToAuth = () => {
    window.location.href = '/spotify-auth';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <CardTitle>Spotify Setup Complete</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {refreshToken ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  ✅ Authentication Successful!
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your Spotify refresh token is ready to use.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-token">Refresh Token:</Label>
                <div className="flex gap-2">
                  <Input
                    id="refresh-token"
                    value={refreshToken}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToken}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Next Steps:
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>1. Copy the refresh token above</li>
                  <li>2. Replace <code>SPOTIFY_REFRESH_TOKEN=your_refresh_token_here</code> in your .env file</li>
                  <li>3. Restart your development server</li>
                  <li>4. Test the integration below</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={testSpotifyAPI} 
                  disabled={testing}
                  className="w-full"
                >
                  {testing ? 'Testing...' : 'Test Spotify Integration'}
                </Button>

                {testResult && (
                  <div className={`p-3 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  }`}>
                    {testResult.success ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-900 dark:text-green-100">
                            Spotify Integration Working!
                          </span>
                        </div>
                        <div className="text-sm text-green-800 dark:text-green-200">
                          <div>🎵 <strong>{testResult.data.name}</strong></div>
                          <div>👤 by {testResult.data.artist}</div>
                          <div>📀 {testResult.data.album}</div>
                          <div>▶️ {testResult.data.is_playing ? 'Currently playing' : 'Recently played'}</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-red-900 dark:text-red-100 mb-1">
                          ❌ Integration Failed
                        </div>
                        <div className="text-sm text-red-800 dark:text-red-200">
                          {testResult.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" asChild className="w-full">
                  <a href="http://127.0.0.1:3000" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Your Portfolio
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No refresh token found. You need to authenticate with Spotify first.
              </p>
              <Button onClick={goToAuth}>
                Go to Spotify Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
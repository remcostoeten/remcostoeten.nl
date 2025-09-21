'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSpotifyAuthUrl } from '@/services/spotifyService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export default function SpotifyAuthPage() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  
  const spotifyError = searchParams.get('spotify_error');
  const spotifySuccess = searchParams.get('spotify_success');
  const refreshToken = searchParams.get('refresh_token');
  const accessToken = searchParams.get('access_token');

  const handleAuthorize = () => {
    const authUrl = getSpotifyAuthUrl();
    window.location.href = authUrl;
  };

  const copyRefreshToken = async () => {
    if (refreshToken) {
      await navigator.clipboard.writeText(refreshToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <CardTitle>Spotify Integration</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {spotifyError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">
                Error: {spotifyError}
              </span>
            </div>
          )}

          {spotifySuccess && refreshToken ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  Authorization successful!
                </span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Refresh Token:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={refreshToken}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs bg-muted border rounded font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyRefreshToken}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-xs text-blue-600 dark:text-blue-300 mt-1 space-y-1">
                  <li>1. Copy the refresh token above</li>
                  <li>2. Add it to your .env file as SPOTIFY_REFRESH_TOKEN</li>
                  <li>3. Restart your development server</li>
                  <li>4. Your Spotify integration will now work!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Connect your Spotify account to show your real listening activity on your portfolio.
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Required Permissions:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• View your currently playing track</li>
                  <li>• View your recently played tracks</li>
                  <li>• View your playback state</li>
                </ul>
              </div>
              
              <Button onClick={handleAuthorize} className="w-full">
                <Music className="w-4 h-4 mr-2" />
                Connect Spotify
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
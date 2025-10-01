'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function SpotifyDebugPage() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  
  const checkEnvVar = (name: string, value: string | undefined) => {
    if (!value) {
      return { status: 'missing', icon: XCircle, color: 'text-red-500' };
    }
    if (value.includes('your_') || value.includes('_here')) {
      return { status: 'placeholder', icon: AlertTriangle, color: 'text-yellow-500' };
    }
    return { status: 'ok', icon: CheckCircle, color: 'text-green-500' };
  };

  const clientIdCheck = checkEnvVar('NEXT_PUBLIC_SPOTIFY_CLIENT_ID', clientId);
  const redirectUriCheck = checkEnvVar('NEXT_PUBLIC_SPOTIFY_REDIRECT_URI', redirectUri);

  const testSpotifyAuth = () => {
    if (!clientId) {
      alert('Client ID is missing!');
      return;
    }
    
    const finalRedirectUri = redirectUri || 'http://127.0.0.1:3000/api/spotify/callback';
    const scopes = [
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-read-playback-state'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: finalRedirectUri,
      show_dialog: 'true'
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('🔗 Auth URL:', authUrl);
    window.open(authUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Spotify Environment Debug</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <clientIdCheck.icon className={`w-5 h-5 ${clientIdCheck.color}`} />
              <div className="flex-1">
                <div className="font-medium">NEXT_PUBLIC_SPOTIFY_CLIENT_ID</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {clientId ? `${clientId.substring(0, 8)}...` : 'Not set'}
                </div>
              </div>
              <div className={`text-sm ${clientIdCheck.color}`}>
                {clientIdCheck.status}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <redirectUriCheck.icon className={`w-5 h-5 ${redirectUriCheck.color}`} />
              <div className="flex-1">
                <div className="font-medium">NEXT_PUBLIC_SPOTIFY_REDIRECT_URI</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {redirectUri || 'Not set'}
                </div>
              </div>
              <div className={`text-sm ${redirectUriCheck.color}`}>
                {redirectUriCheck.status}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Current Values:</h3>
            <div className="space-y-1 text-sm font-mono">
              <div>Client ID: {clientId || 'MISSING'}</div>
              <div>Redirect URI: {redirectUri || 'http://127.0.0.1:3000/api/spotify/callback (fallback)'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={testSpotifyAuth} 
              disabled={clientIdCheck.status !== 'ok' || redirectUriCheck.status !== 'ok'}
              className="w-full"
            >
              Test Spotify Authorization
            </Button>
            
            {clientIdCheck.status !== 'ok' && (
              <p className="text-sm text-muted-foreground text-center">
                Fix the environment variables above, then restart your dev server
              </p>
            )}
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Troubleshooting Steps:
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>1. Make sure your .env file is in apps/frontend/</li>
              <li>2. Restart your development server after changing .env</li>
              <li>3. Check that your Spotify app redirect URI matches exactly</li>
              <li>4. Verify your Client ID in the Spotify Developer Dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
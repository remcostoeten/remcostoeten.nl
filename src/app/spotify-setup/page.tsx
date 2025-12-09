'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Music, ExternalLink, Check, AlertCircle, RefreshCw, Eye, EyeOff, Copy } from 'lucide-react';

interface SpotifyTokens {
  refresh_token: string;
  access_token: string;
}

function SpotifySetupContent() {
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const refreshToken = searchParams.get('refresh_token');
    const accessToken = searchParams.get('access_token');

    if (success === '1' && refreshToken && accessToken) {
      setTokens({ refresh_token: refreshToken, access_token: accessToken });
      window.history.replaceState({}, '', '/spotify-setup');
    } else if (error) {
      const details = searchParams.get('details');
      setError(details || error);
      window.history.replaceState({}, '', '/spotify-setup');
    }
  }, [searchParams]);

  const generateAuthUrl = async () => {
    if (!clientId.trim()) {
      setError('Please enter your Spotify Client ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/spotify/auth-url');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate authorization URL');
      }

      setAuthUrl(data.authUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const updateEnvFile = () => {
    if (!tokens) return;

    const envContent = `# Spotify credentials
SPOTIFY_CLIENT_ID=${clientId || 'your_spotify_client_id_here'}
SPOTIFY_CLIENT_SECRET=${clientSecret || 'your_spotify_client_secret_here'}
SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback`;

    copyToClipboard(envContent, 'env');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Music className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Spotify API Setup</h1>
            <p className="text-muted-foreground">Configure your Spotify integration</p>
          </div>
        </div>

        {tokens && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl dark:bg-green-950 dark:border-green-800">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Authentication Successful!
              </h2>
            </div>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your Spotify account has been connected. Here are your credentials:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg dark:bg-black/20">
                <label className="text-sm font-medium text-muted-foreground min-w-[100px]">
                  Client ID:
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border rounded-md"
                  placeholder="Enter your Client ID"
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg dark:bg-black/20">
                <label className="text-sm font-medium text-muted-foreground min-w-[100px]">
                  Client Secret:
                </label>
                <div className="flex-1 relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-background border rounded-md"
                    placeholder="Enter your Client Secret"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg dark:bg-black/20">
                <label className="text-sm font-medium text-muted-foreground min-w-[100px]">
                  Refresh Token:
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={tokens.refresh_token}
                    readOnly
                    className="w-full px-3 py-2 pr-10 bg-background border rounded-md font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(tokens.refresh_token, 'refresh')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={updateEnvFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                {copied === 'env' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy .env content
                  </>
                )}
              </button>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Click this button to copy the complete .env configuration to your clipboard
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-6 bg-card border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h3 className="text-lg font-semibold">Create Spotify App</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              First, create a Spotify Developer app to get your Client ID and Client Secret.
            </p>

            <ol className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>1. Go to the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Spotify Developer Dashboard <ExternalLink className="w-3 h-3" /></a></li>
              <li>2. Log in with your Spotify account</li>
              <li>3. Click "Create app"</li>
              <li>4. Fill in app details (app name, description, website)</li>
              <li>5. Check "Web API" for the API you want to use</li>
              <li>6. Click "Save"</li>
            </ol>
          </div>

          <div className="p-6 bg-card border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <h3 className="text-lg font-semibold">Configure Redirect URI</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Add the redirect URI to your Spotify app settings.
            </p>

            <div className="p-3 bg-muted rounded-lg mb-4">
              <code className="text-sm">http://127.0.0.1:3000/api/spotify/callback</code>
              <button
                onClick={() => copyToClipboard('http://127.0.0.1:3000/api/spotify/callback', 'uri')}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-4 h-4 inline" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              In your Spotify app dashboard, go to "Edit Settings" and add this URL to "Redirect URIs".
            </p>
          </div>

          <div className="p-6 bg-card border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <h3 className="text-lg font-semibold">Connect Your Account</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Enter your Spotify app credentials and authorize this application.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Spotify Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Your Spotify Client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Spotify Client Secret</label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Your Spotify Client Secret"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
                  </div>
                </div>
              )}

              {!authUrl ? (
                <button
                  onClick={generateAuthUrl}
                  disabled={loading || !clientId.trim() || !clientSecret.trim()}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating authorization link...
                    </>
                  ) : (
                    'Generate Authorization Link'
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Authorization link generated! Click the button below to authorize this app with Spotify.
                    </p>
                  </div>

                  <a
                    href={authUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 bg-spotify-green text-white rounded-lg hover:bg-spotify-green/90 transition-colors text-center font-medium"
                  >
                    Authorize with Spotify <ExternalLink className="w-4 h-4 inline ml-1" />
                  </a>

                  <button
                    onClick={() => setAuthUrl('')}
                    className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Generate new link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpotifySetupPage() {
  return (
    <Suspense>
      <SpotifySetupContent />
    </Suspense>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SpotifyDevPage() {
    const searchParams = useSearchParams();
    const [authUrl, setAuthUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokens, setTokens] = useState<{
        refresh_token: string | null;
        access_token: string | null;
    } | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const refreshToken = searchParams.get('refresh_token');
        const accessToken = searchParams.get('access_token');
        const urlError = searchParams.get('error');
        const details = searchParams.get('details');

        if (urlError) {
            setError(`${urlError}${details ? `: ${details}` : ''}`);
        }

        if (refreshToken || accessToken) {
            setTokens({
                refresh_token: refreshToken,
                access_token: accessToken,
            });
        }
    }, [searchParams]);

    const handleGetAuthUrl = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/spotify/auth-url');
            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            setAuthUrl(data.authUrl);
        } catch (err) {
            setError('Failed to get authorization URL');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (text: string, type: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleStartAuth = () => {
        if (authUrl) {
            window.location.href = authUrl;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Spotify Token Generator
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Generate a refresh token for the Spotify API integration
                    </p>
                </div>

                {/* Error display */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Success: Display tokens */}
                {tokens?.refresh_token && (
                    <div className="mb-8 space-y-4">
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <p className="text-green-400 text-sm font-medium mb-2">
                                ✓ Authorization successful!
                            </p>
                            <p className="text-zinc-400 text-sm">
                                Copy the refresh token below and add it to your{' '}
                                <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                    .env
                                </code>{' '}
                                file.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <TokenField
                                label="Refresh Token"
                                value={tokens.refresh_token}
                                envVar="SPOTIFY_REFRESH_TOKEN"
                                copied={copied === 'refresh'}
                                onCopy={() => handleCopy(tokens.refresh_token!, 'refresh')}
                            />

                            {tokens.access_token && (
                                <TokenField
                                    label="Access Token"
                                    value={tokens.access_token}
                                    envVar="(temporary, expires in 1 hour)"
                                    copied={copied === 'access'}
                                    onCopy={() => handleCopy(tokens.access_token!, 'access')}
                                />
                            )}
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            <p className="text-zinc-400 text-sm mb-2">
                                Add this to your <code className="text-zinc-300">.env</code>{' '}
                                file:
                            </p>
                            <pre className="text-sm text-emerald-400 bg-zinc-950 p-3 rounded-lg overflow-x-auto">
                                SPOTIFY_REFRESH_TOKEN={tokens.refresh_token}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Step-by-step flow when no tokens yet */}
                {!tokens?.refresh_token && (
                    <div className="space-y-6">
                        {/* Step 1: Get auth URL */}
                        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                                    1
                                </div>
                                <h2 className="text-lg font-semibold">
                                    Generate Authorization URL
                                </h2>
                            </div>

                            <p className="text-zinc-400 text-sm mb-4">
                                First, generate the Spotify authorization URL. Make sure you
                                have{' '}
                                <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                    SPOTIFY_CLIENT_ID
                                </code>{' '}
                                and{' '}
                                <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                    SPOTIFY_CLIENT_SECRET
                                </code>{' '}
                                in your{' '}
                                <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                    .env
                                </code>{' '}
                                file.
                            </p>

                            <button
                                onClick={handleGetAuthUrl}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Get Authorization URL'}
                            </button>
                        </div>

                        {/* Step 2: Authorize with Spotify */}
                        {authUrl && (
                            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                                        2
                                    </div>
                                    <h2 className="text-lg font-semibold">
                                        Authorize with Spotify
                                    </h2>
                                </div>

                                <p className="text-zinc-400 text-sm mb-4">
                                    Click the button below to authorize your Spotify account.
                                    You'll be redirected back here with your refresh token.
                                </p>

                                <button
                                    onClick={handleStartAuth}
                                    className="px-4 py-2 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black font-medium transition-colors flex items-center gap-2"
                                >
                                    <SpotifyIcon />
                                    Connect Spotify
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Requirements info */}
                <div className="mt-8 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                    <h3 className="text-sm font-medium text-zinc-300 mb-2">
                        Required Environment Variables
                    </h3>
                    <ul className="text-xs text-zinc-500 space-y-1">
                        <li>
                            <code className="text-zinc-400">SPOTIFY_CLIENT_ID</code> - From
                            Spotify Developer Dashboard
                        </li>
                        <li>
                            <code className="text-zinc-400">SPOTIFY_CLIENT_SECRET</code> -
                            From Spotify Developer Dashboard
                        </li>
                        <li>
                            <code className="text-zinc-400">SPOTIFY_REDIRECT_URI</code> -
                            Should be{' '}
                            <code className="text-zinc-400">
                                {typeof window !== 'undefined'
                                    ? `${window.location.origin}/dev/spotify`
                                    : 'http://localhost:3000/dev/spotify'}
                            </code>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function TokenField({
    label,
    value,
    envVar,
    copied,
    onCopy,
}: {
    label: string;
    value: string;
    envVar: string;
    copied: boolean;
    onCopy: () => void;
}) {
    return (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-300">{label}</span>
                <span className="text-xs text-zinc-500">{envVar}</span>
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-mono"
                />
                <button
                    onClick={onCopy}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
        </div>
    );
}

function SpotifyIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
    );
}

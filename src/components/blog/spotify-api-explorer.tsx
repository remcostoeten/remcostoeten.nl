'use client'

import { useState, useEffect, useCallback } from 'react';
import { Play, Copy, Check, ChevronDown, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

interface Endpoint {
    name: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    path: string
    description: string
    requiresAuth: boolean
    scopes?: string[]
}

const SPOTIFY_ENDPOINTS: Endpoint[] = [
    {
        name: 'Currently Playing',
        method: 'GET',
        path: '/v1/me/player/currently-playing',
        description: 'Get the currently playing track',
        requiresAuth: true,
        scopes: ['user-read-currently-playing'],
    },
    {
        name: 'User Profile',
        method: 'GET',
        path: '/v1/me',
        description: 'Get the current user\'s profile',
        requiresAuth: true,
        scopes: ['user-read-private'],
    },
    {
        name: 'Top Tracks',
        method: 'GET',
        path: '/v1/me/top/tracks?limit=10',
        description: 'Get user\'s top 10 tracks',
        requiresAuth: true,
        scopes: ['user-top-read'],
    },
    {
        name: 'Recently Played',
        method: 'GET',
        path: '/v1/me/player/recently-played?limit=5',
        description: 'Get recently played tracks',
        requiresAuth: true,
        scopes: ['user-read-recently-played'],
    },
    {
        name: 'Search Tracks',
        method: 'GET',
        path: '/v1/search?q=radiohead&type=track&limit=5',
        description: 'Search for tracks (public endpoint)',
        requiresAuth: true,
    },
]

/**
 * Postman-style API explorer for Spotify endpoints.
 * Users can paste their access token and test real API calls.
 */
export function SpotifyApiExplorer() {
    const [accessToken, setAccessToken] = useState('')
    const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(SPOTIFY_ENDPOINTS[0])
    const [response, setResponse] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [showEndpoints, setShowEndpoints] = useState(false)

    const handleExecute = useCallback(async () => {
        if (!accessToken) {
            setError('Access token is required')
            return
        }

        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            const res = await fetch(`https://api.spotify.com${selectedEndpoint.path}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            const data = await res.json()

            if (!res.ok) {
                setError(`${res.status}: ${data.error?.message || 'Request failed'}`)
                setResponse(JSON.stringify(data, null, 2))
            } else {
                setResponse(JSON.stringify(data, null, 2))
            }
        } catch (err) {
            setError('Network error - check your connection')
        } finally {
            setLoading(false)
        }
    }, [accessToken, selectedEndpoint])

    const handleCopyResponse = useCallback(() => {
        if (response) {
            navigator.clipboard.writeText(response)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }, [response])

    const methodColors = {
        GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    }

    return (
        <div className="my-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-none bg-orange-500/10 flex items-center justify-center">
                        <TerminalIcon className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">API Explorer</h3>
                        <p className="text-[10px] text-zinc-500">Test Spotify endpoints with your access token</p>
                    </div>
                </div>
                <a
                    href="https://developer.spotify.com/documentation/web-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-zinc-500 hover:text-orange-400 flex items-center gap-1 transition-colors"
                >
                    API Docs <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="p-6 space-y-4">
                {/* Token Input */}
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        Access Token
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="Paste your access token (from /dev/spotify)"
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1.5 ml-1">
                        Get one from the{' '}
                        <a href="/dev/spotify" className="text-orange-400 hover:underline">
                            Token Generator
                        </a>
                        {' '}— expires in 1 hour
                    </p>
                </div>

                {/* Endpoint Selector */}
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        Endpoint
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowEndpoints(!showEndpoints)}
                            className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${methodColors[selectedEndpoint.method]}`}>
                                    {selectedEndpoint.method}
                                </span>
                                <span className="text-zinc-200">{selectedEndpoint.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showEndpoints ? 'rotate-180' : ''}`} />
                        </button>

                        {showEndpoints && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                                {SPOTIFY_ENDPOINTS.map((endpoint) => (
                                    <button
                                        key={endpoint.path}
                                        onClick={() => {
                                            setSelectedEndpoint(endpoint)
                                            setShowEndpoints(false)
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-900 transition-colors ${selectedEndpoint.path === endpoint.path ? 'bg-zinc-900' : ''
                                            }`}
                                    >
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${methodColors[endpoint.method]}`}>
                                            {endpoint.method}
                                        </span>
                                        <div>
                                            <p className="text-sm text-zinc-200">{endpoint.name}</p>
                                            <p className="text-[10px] text-zinc-500">{endpoint.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Path Display */}
                    <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs">
                        <span className="text-zinc-500">https://api.spotify.com</span>
                        <span className="text-orange-400">{selectedEndpoint.path}</span>
                    </div>

                    {selectedEndpoint.scopes && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[10px] text-zinc-500">Required scopes:</span>
                            {selectedEndpoint.scopes.map((scope) => (
                                <span key={scope} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                    {scope}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Execute Button */}
                <button
                    onClick={handleExecute}
                    disabled={loading || !accessToken}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-black font-bold hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Play className="w-4 h-4" />
                    )}
                    {loading ? 'Executing...' : 'Send Request'}
                </button>

                {/* Error Display */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-400">Request Failed</p>
                            <p className="text-xs text-red-300/80">{error}</p>
                        </div>
                    </div>
                )}

                {/* Response Display */}
                {response && (
                    <div className="relative">
                        <div className="absolute top-3 right-3 z-10">
                            <button
                                onClick={handleCopyResponse}
                                className={`px-3 py-1.5 rounded-none text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all ${copied
                                    ? 'bg-green-500 text-black'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                    }`}
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="p-4 pt-12 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 overflow-x-auto max-h-96 overflow-y-auto">
                            <code>{response}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

function TerminalIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
}

export default SpotifyApiExplorer

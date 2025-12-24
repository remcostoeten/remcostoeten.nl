'use client'

import React, { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react'

interface SpotifyEnvGeneratorProps {
    showGuide?: boolean
}

/**
 * Interactive .env generator for Spotify credentials.
 * Validates inputs and provides one-click copy functionality.
 */
export function SpotifyEnvGenerator({ showGuide = true }: SpotifyEnvGeneratorProps) {
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [refreshToken, setRefreshToken] = useState('')
    const [copied, setCopied] = useState(false)

    const isClientIdValid = clientId.length === 32
    const isSecretValid = clientSecret.length === 32
    const isRefreshTokenValid = refreshToken.length > 50

    const redirectUri = typeof window !== 'undefined'
        ? `${window.location.origin}/api/spotify/callback`
        : 'http://127.0.0.1:3000/api/spotify/callback'

    const envBlock = `# Spotify Integration
SPOTIFY_CLIENT_ID="${clientId || 'your_client_id'}"
SPOTIFY_CLIENT_SECRET="${clientSecret || 'your_client_secret'}"
SPOTIFY_REDIRECT_URI="${redirectUri}"
SPOTIFY_REFRESH_TOKEN="${refreshToken || 'your_refresh_token'}"`

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(envBlock)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [envBlock])

    return (
        <div className="my-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-none AAAA bg-green-500/10 flex items-center justify-center">
                        <SpotifyIcon className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">Environment Generator</h3>
                        <p className="text-[10px] text-zinc-500">Paste your credentials to generate your .env block</p>
                    </div>
                </div>
                <a
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-zinc-500 hover:text-green-400 flex items-center gap-1 transition-colors"
                >
                    Open Dashboard <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="p-6 space-y-4">
                {showGuide && (
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
                        <p className="text-xs text-blue-300/80 leading-relaxed">
                            <strong className="text-blue-300">Tip:</strong> Create an app in the{' '}
                            <a href="https://developer.spotify.com/dashboard" target="_blank" className="underline hover:text-blue-200">
                                Spotify Dashboard
                            </a>
                            , then copy the Client ID and Secret below.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Client ID"
                        value={clientId}
                        onChange={setClientId}
                        placeholder="32-character ID"
                        isValid={isClientIdValid}
                        showValidation={clientId.length > 0}
                        errorMessage="Must be exactly 32 characters"
                    />
                    <InputField
                        label="Client Secret"
                        value={clientSecret}
                        onChange={setClientSecret}
                        placeholder="32-character Secret"
                        type="password"
                        isValid={isSecretValid}
                        showValidation={clientSecret.length > 0}
                        errorMessage="Must be exactly 32 characters"
                    />
                </div>

                <InputField
                    label="Refresh Token (optional)"
                    value={refreshToken}
                    onChange={setRefreshToken}
                    placeholder="Paste from /dev/spotify tool"
                    isValid={isRefreshTokenValid}
                    showValidation={refreshToken.length > 0}
                    hint={
                        <span>
                            Don't have one? Use the{' '}
                            <a href="/dev/spotify" className="text-green-400 hover:underline">
                                Token Generator
                            </a>
                        </span>
                    }
                />

                <div className="relative mt-6">
                    <div className="absolute top-3 right-3 z-10">
                        <button
                            onClick={handleCopy}
                            className={`px-3 py-1.5 rounded-none AAAA text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all ${copied
                                ? 'bg-green-500 text-black'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                }`}
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <pre className="p-4 pt-12 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 overflow-x-auto">
                        <code>
                            <span className="text-zinc-600"># Spotify Integration</span>{'\n'}
                            <span className="text-zinc-500">SPOTIFY_CLIENT_ID</span>=
                            <span className={clientId ? 'text-emerald-400' : 'text-zinc-600'}>"{clientId || 'your_client_id'}"</span>{'\n'}
                            <span className="text-zinc-500">SPOTIFY_CLIENT_SECRET</span>=
                            <span className={clientSecret ? 'text-emerald-400' : 'text-zinc-600'}>"{clientSecret ? '••••••••' : 'your_client_secret'}"</span>{'\n'}
                            <span className="text-zinc-500">SPOTIFY_REDIRECT_URI</span>=
                            <span className="text-emerald-400">"{redirectUri}"</span>{'\n'}
                            <span className="text-zinc-500">SPOTIFY_REFRESH_TOKEN</span>=
                            <span className={refreshToken ? 'text-emerald-400' : 'text-zinc-600'}>"{refreshToken ? `${refreshToken.substring(0, 20)}...` : 'your_refresh_token'}"</span>
                        </code>
                    </pre>
                </div>

                <ValidationSummary
                    items={[
                        { label: 'Client ID', valid: isClientIdValid, required: true },
                        { label: 'Client Secret', valid: isSecretValid, required: true },
                        { label: 'Refresh Token', valid: isRefreshTokenValid, required: false },
                    ]}
                />
            </div>
        </div>
    )
}

// Sub-components
function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    isValid,
    showValidation,
    errorMessage,
    hint,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    placeholder: string
    type?: string
    isValid: boolean
    showValidation: boolean
    errorMessage?: string
    hint?: React.ReactNode
}) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm font-mono placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${showValidation && !isValid ? 'border-red-500/50' : 'border-zinc-800'
                        }`}
                />
                {showValidation && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                )}
            </div>
            {showValidation && !isValid && errorMessage && (
                <p className="text-[10px] text-red-400 mt-1 ml-1">{errorMessage}</p>
            )}
            {hint && <p className="text-[10px] text-zinc-500 mt-1.5 ml-1">{hint}</p>}
        </div>
    )
}

function ValidationSummary({
    items,
}: {
    items: { label: string; valid: boolean; required: boolean }[]
}) {
    const allRequiredValid = items.filter((i) => i.required).every((i) => i.valid)

    return (
        <div className={`mt-4 p-4 rounded-xl border ${allRequiredValid ? 'bg-green-500/5 border-green-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
            <div className="flex items-center gap-2 mb-3">
                {allRequiredValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                <span className={`text-xs font-semibold ${allRequiredValid ? 'text-green-400' : 'text-amber-400'}`}>
                    {allRequiredValid ? 'Ready to Copy' : 'Missing Required Fields'}
                </span>
            </div>
            <div className="flex flex-wrap gap-3">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border ${item.valid
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : item.required
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                            }`}
                    >
                        {item.valid ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.label}
                        {!item.required && <span className="opacity-50">(optional)</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}

function SpotifyIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
    )
}

export default SpotifyEnvGenerator

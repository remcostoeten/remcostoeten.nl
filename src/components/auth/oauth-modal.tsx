'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import posthog from 'posthog-js';

interface OAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: 'github' | 'google';
}

export function OAuthModal({ isOpen, onClose, provider }: OAuthModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async () => {
        setIsLoading(true);
        setError(null);

        // Track sign in initiated event
        posthog.capture('sign_in_initiated', {
            provider: provider,
            source: 'oauth_modal',
        });

        try {
            await signIn.social({
                provider,
                callbackURL: `${window.location.origin}`,
            });

            onClose();
        } catch (err) {
            console.error('OAuth error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMessage);
            setIsLoading(false);

            // Track error
            posthog.captureException(err instanceof Error ? err : new Error(errorMessage));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md"
                    >
                        <div className="bg-zinc-950 border border-zinc-800 rounded-none shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                                <h2 className="text-lg font-semibold text-white">
                                    Sign in with {provider === 'github' ? 'GitHub' : 'Google'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    aria-label="Close modal"
                                    className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-6 py-8">
                                <div className="text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                                        <svg
                                            className="w-8 h-8 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            {provider === 'github' ? (
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            ) : (
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            )}
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-zinc-300 mb-2">
                                            You'll be redirected to {provider === 'github' ? 'GitHub' : 'Google'} to complete authentication
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            Click the button below to continue
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-none">
                                            <p className="text-sm text-red-400">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSignIn}
                                        disabled={isLoading}
                                        className="w-full px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-900 font-medium rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                Redirecting...
                                            </span>
                                        ) : (
                                            `Continue with ${provider === 'github' ? 'GitHub' : 'Google'}`
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800">
                                <p className="text-xs text-zinc-500 text-center">
                                    By signing in, you agree to our terms and privacy policy
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

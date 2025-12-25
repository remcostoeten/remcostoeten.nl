'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OAuthCallbackContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check if we have an error or success
        const error = searchParams.get('error');
        const code = searchParams.get('code');

        if (window.opener) {
            if (error) {
                // Send error message to parent window
                window.opener.postMessage(
                    {
                        type: 'oauth-error',
                        error: error,
                    },
                    window.location.origin
                );
            } else if (code) {
                // Send success message to parent window
                window.opener.postMessage(
                    {
                        type: 'oauth-success',
                    },
                    window.location.origin
                );
            }

            // Close the popup after a short delay
            setTimeout(() => {
                window.close();
            }, 500);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto">
                    <svg
                        className="animate-spin text-purple-500"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
                <p className="text-zinc-400 font-mono text-sm">
                    Completing authentication...
                </p>
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto">
                        <svg
                            className="animate-spin text-purple-500"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </div>
                    <p className="text-zinc-400 font-mono text-sm">
                        Loading...
                    </p>
                </div>
            </div>
        }>
            <OAuthCallbackContent />
        </Suspense>
    );
}

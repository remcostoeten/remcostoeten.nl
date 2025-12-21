'use client'

import { useState } from 'react'
import { Github } from 'lucide-react'
import { signIn } from '@/lib/auth-client'
import posthog from 'posthog-js'

export function SignInButton() {
    const [isLoading, setIsLoading] = useState<'github' | 'google' | null>(null)

    const handleSignIn = async (provider: 'github' | 'google') => {
        setIsLoading(provider)

                posthog.capture('sign_in_initiated', {
            provider: provider,
            source: 'blog_sign_in_button',
        })

        try {
            await signIn.social({
                provider,
                callbackURL: window.location.href,
            })
        } catch (error) {
            console.error('Sign in error:', error)
            setIsLoading(null)

                        posthog.captureException(error instanceof Error ? error : new Error('Sign in failed'))
        }
    }

    return (
        <div className="flex gap-3 justify-center">
            <button
                onClick={() => handleSignIn('github')}
                disabled={isLoading !== null}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white 
                    rounded-lg transition-colors flex items-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Github className="w-4 h-4" />
                {isLoading === 'github' ? 'Signing in...' : 'GitHub'}
            </button>
            <button
                onClick={() => handleSignIn('google')}
                disabled={isLoading !== null}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white 
                    rounded-lg transition-colors flex items-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isLoading === 'google' ? 'Signing in...' : 'Google'}
            </button>
        </div>
    )
}

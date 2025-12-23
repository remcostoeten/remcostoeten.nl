"use client"

import { useEffect, useState } from "react"
import { Github } from "lucide-react"
import posthog from "posthog-js"
import { signIn } from "@/lib/auth-client"

type Provider = "github" | "google"

type ProviderList = {
    providers: Provider[]
}

export function SignInButton() {
    const [isLoading, setIsLoading] = useState<Provider | null>(null)
    const [providers, setProviders] = useState<Provider[] | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [authError, setAuthError] = useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        async function fetchProviders() {
            try {
                setLoadError(null)
                const response = await fetch("/api/auth/providers", {
                    cache: "no-store"
                })
                if (!response.ok) {
                    throw new Error("Failed to load sign-in options")
                }
                const data = (await response.json()) as ProviderList
                if (!isActive) return
                setProviders(data?.providers)
                if (data?.providers?.length === 0) {
                    setLoadError(
                        "Sign-in is not available right now. Please configure an OAuth provider."
                    )
                }
            } catch (error) {
                if (!isActive) return
                setProviders([])
                setLoadError(
                    "Unable to load sign-in options. Please try again later."
                )
            }
        }

        fetchProviders()

        return () => {
            isActive = false
        }
    }, [])

    function handleSignIn(provider: Provider) {
        if (isLoading !== null) return
        setAuthError(null)
        setIsLoading(provider)

        posthog.capture("sign_in_initiated", {
            provider: provider,
            source: "blog_sign_in_button"
        })

        signIn
            .social({
                provider,
                callbackURL: window.location.href
            })
            .catch(error => {
                console.error("Sign in error:", error)
                setIsLoading(null)
                setAuthError(
                    "Sign-in failed. Please check your OAuth configuration or try another provider."
                )
                posthog.captureException(
                    error instanceof Error ? error : new Error("Sign in failed")
                )
            })
    }

    function renderGithubButton() {
        if (!providers?.includes("github")) return null

        return (
            <button
                onClick={() => handleSignIn("github")}
                disabled={isLoading !== null}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white 
                    rounded-lg transition-colors flex items-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Github className="w-4 h-4" />
                {isLoading === "github" ? "Signing in..." : "GitHub"}
            </button>
        )
    }

    function renderGoogleButton() {
        if (!providers?.includes("google")) return null

        return (
            <button
                onClick={() => handleSignIn("google")}
                disabled={isLoading !== null}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white 
                    rounded-lg transition-colors flex items-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isLoading === "google" ? "Signing in..." : "Google"}
            </button>
        )
    }

    function renderButtons() {
        if (providers === null) {
            return (
                <p
                    className="text-sm text-zinc-400 text-center"
                    role="status"
                    aria-live="polite"
                >
                    Loading sign-in options...
                </p>
            )
        }

        if (loadError) {
            return (
                <div className="text-sm text-destructive" role="alert">
                    {loadError}
                </div>
            )
        }

        return (
            <div className="flex gap-3 justify-center flex-wrap">
                {renderGithubButton()}
                {renderGoogleButton()}
                {providers?.length === 0 && (
                    <p className="text-sm text-zinc-400">
                        No sign-in providers are configured.
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {renderButtons()}
            {authError && (
                <p
                    className="text-sm text-destructive text-center"
                    role="alert"
                >
                    {authError}
                </p>
            )}
        </div>
    )
}

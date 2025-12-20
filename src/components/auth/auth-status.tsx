'use client'

import { useSession, signOut } from "@/lib/auth-client"

export function AuthStatus() {
    const { data: session, isPending } = useSession()

    if (isPending) {
        return <div className="text-xs text-neutral-500">Loading...</div>
    }

    if (!session) {
        return (
            <a
                href="/sign-in"
                className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
                Sign in
            </a>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">
                {session.user.email}
            </span>
            <button
                onClick={() => signOut()}
                className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
                Sign out
            </button>
        </div>
    )
}

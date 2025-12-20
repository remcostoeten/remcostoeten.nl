import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [adminClient()],
    baseURL: typeof window !== 'undefined' ? window.location.origin : '',
})

export const { signIn, signOut, useSession } = authClient

// Custom signIn function for popup-based OAuth
export const signInWithPopup = async (provider: 'github' | 'google') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${baseUrl}/auth/callback`;

    return signIn.social({
        provider,
        callbackURL: callbackUrl,
    });
}

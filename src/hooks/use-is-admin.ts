'use client'

import { useSession } from '@/lib/auth-client'

const ADMIN_EMAIL = 'remcostoeten@gmail.com'

/**
 * Client-side hook to check if the current user is admin
 */
export function useIsAdmin() {
    const { data: session, isPending } = useSession()

    const isAdmin = !isPending && session?.user && (
        session.user.role === 'admin' ||
        session.user.email === ADMIN_EMAIL
    )

    return {
        isAdmin: !!isAdmin,
        isLoading: isPending,
        user: session?.user ?? null,
    }
}

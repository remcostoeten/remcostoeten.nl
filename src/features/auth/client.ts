import { useEffect } from 'react'
import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { setSessionHint } from './session-hint'

const authClient = createAuthClient({
	plugins: [adminClient()],
	baseURL: typeof window !== 'undefined' ? window.location.origin : ''
})

export const { signOut } = authClient

export type SessionUser = typeof authClient.$Infer.Session.user

/**
 * @name useSession
 * @description Better Auth's session hook, plus a sync of the session hint so
 * pages that skip the session request know whether this browser is signed in.
 *
 * @example
 * const { data: session, isPending } = useSession()
 */
export function useSession() {
	const session = authClient.useSession()
	const hasUser = Boolean(session.data?.user)

	useEffect(() => {
		if (!session.isPending) setSessionHint(hasUser)
	}, [session.isPending, hasUser])

	return session
}

/**
 * @name signInWithProvider
 * @description Starts the social OAuth redirect and marks the browser as
 * probably signed in, so the page that receives the callback asks for the
 * session.
 *
 * @example
 * await signInWithProvider('github', window.location.href)
 */
export async function signInWithProvider(
	provider: 'github' | 'google',
	callbackURL: string
): Promise<void> {
	setSessionHint(true)
	await authClient.signIn.social({ provider, callbackURL })
}

/**
 * @name signInWithPopup
 * @description Social sign-in that lands on the admin dashboard.
 *
 * @example
 * await signInWithPopup('github')
 */
export async function signInWithPopup(
	provider: 'github' | 'google'
): Promise<void> {
	await signInWithProvider(provider, '/admin')
}

const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

/**
 * @name linkGmail
 * @description Starts Google's consent screen for the Gmail send permission
 * and links the chosen Google account to the signed-in admin. Requests
 * offline access so the server can refresh tokens later.
 *
 * @example
 * await linkGmail('/admin/settings')
 */
export async function linkGmail(returnPath: string): Promise<void> {
	await authClient.linkSocial({
		provider: 'google',
		scopes: [GMAIL_SEND_SCOPE],
		callbackURL: `${returnPath}?gmail=linked`,
		errorCallbackURL: `${returnPath}?gmail=error`,
		additionalParams: { access_type: 'offline', prompt: 'consent' }
	})
}

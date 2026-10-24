import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/server/auth'
import { db } from '@/server/db/connection'
import { account } from '@/server/db/auth-schema'
import { env } from '@/server/env'
import { getAdminSessionUser } from '@/utils/is-admin'

export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

export type GmailState =
	| 'not_configured'
	| 'disconnected'
	| 'needs_reauth'
	| 'connected'

export type GmailStatus = {
	state: GmailState
	email: string | null
}

export type GmailConnection =
	| {
			state: 'connected'
			email: string
			name?: string | null
			accessToken: string
	  }
	| { state: Exclude<GmailState, 'connected'>; email: string | null }

const TOKEN_EXPIRY_MARGIN_MS = 5000
const TOKEN_INFO_ENDPOINT = 'https://oauth2.googleapis.com/tokeninfo'
const TOKEN_INFO_TIMEOUT_MS = 3000
const REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke'

function splitScopes(scope: string | null | undefined) {
	return (scope ?? '').split(/[,\s]+/).filter(Boolean)
}

type IdTokenClaims = { email: string | null; name: string | null }

function readIdTokenClaims(idToken: string | null | undefined): IdTokenClaims {
	const empty = { email: null, name: null }
	if (!idToken) return empty

	try {
		const payload = idToken.split('.')[1]
		const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
		const claims: {
			email?: string
			name?: string
			email_verified?: boolean
		} = JSON.parse(
			new TextDecoder().decode(
				Uint8Array.from(json, character => character.charCodeAt(0))
			)
		)

		if (!claims.email || claims.email_verified === false) return empty
		return {
			email: claims.email.toLowerCase(),
			name: claims.name?.trim() || null
		}
	} catch {
		return empty
	}
}

async function isAccessTokenLive(accessToken: string) {
	try {
		const response = await fetch(TOKEN_INFO_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ access_token: accessToken }),
			signal: AbortSignal.timeout(TOKEN_INFO_TIMEOUT_MS),
			cache: 'no-store'
		})
		return response.status !== 400
	} catch {
		return true
	}
}

/**
 * @name resolveGmailConnection
 * @description Resolves the Gmail account linked to the signed-in admin and
 * returns a valid access token for it, refreshing through Better Auth when it
 * has expired. It needs a real session, so DEV_OPEN_ADMIN is never enough. The
 * token stays on the server and the sender is the linked account's verified
 * address.
 *
 * @example
 * const connection = await resolveGmailConnection()
 * if (connection.state === 'connected') send(connection.accessToken)
 */
export async function resolveGmailConnection(): Promise<GmailConnection> {
	if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
		return { state: 'not_configured', email: null }
	}

	const adminUser = await getAdminSessionUser()
	if (!adminUser) return { state: 'disconnected', email: null }

	const googleAccounts = await db
		.select()
		.from(account)
		.where(
			and(
				eq(account.userId, adminUser.id),
				eq(account.providerId, 'google')
			)
		)
		.orderBy(desc(account.updatedAt))

	const linked = googleAccounts.find(row =>
		splitScopes(row.scope).includes(GMAIL_SEND_SCOPE)
	)
	if (!linked) return { state: 'disconnected', email: null }

	try {
		const tokens = await auth.api.getAccessToken({
			body: { accountId: linked.id },
			headers: await headers()
		})
		const { email, name } = readIdTokenClaims(
			tokens.idToken ?? linked.idToken
		)
		const expired =
			tokens.accessTokenExpiresAt !== undefined &&
			new Date(tokens.accessTokenExpiresAt).getTime() - Date.now() <
				TOKEN_EXPIRY_MARGIN_MS

		if (!email || !tokens.accessToken || expired) {
			return { state: 'needs_reauth', email }
		}
		if (!tokens.scopes?.includes(GMAIL_SEND_SCOPE)) {
			return { state: 'disconnected', email }
		}

		return {
			state: 'connected',
			email,
			name,
			accessToken: tokens.accessToken
		}
	} catch {
		return {
			state: 'needs_reauth',
			email: readIdTokenClaims(linked.idToken).email
		}
	}
}

/**
 * @name getGmailStatus
 * @description Reports whether sending from Gmail is configured, connected or
 * needs the admin to authorise again. A connected account is checked against
 * Google so a revoked grant shows up at once. It never exposes a token.
 *
 * @example
 * const { state, email } = await getGmailStatus()
 */
export async function getGmailStatus(): Promise<GmailStatus> {
	const connection = await resolveGmailConnection()

	if (connection.state === 'connected') {
		const live = await isAccessTokenLive(connection.accessToken)
		if (!live) return { state: 'needs_reauth', email: connection.email }
	}

	return { state: connection.state, email: connection.email }
}

async function revokeGrant(accountId: string) {
	try {
		const tokens = await auth.api.getAccessToken({
			body: { accountId },
			headers: await headers()
		})
		if (!tokens.accessToken) return

		await fetch(REVOKE_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ token: tokens.accessToken }),
			signal: AbortSignal.timeout(TOKEN_INFO_TIMEOUT_MS)
		})
	} catch (error) {
		console.error('[gmail] Could not revoke the Google grant:', error)
	}
}

/**
 * @name unlinkGmail
 * @description Removes the Gmail send permission from the admin's linked Google
 * accounts. The grant is revoked at Google on a best-effort basis, the stored
 * tokens are cleared and the scope is dropped. The account row stays, so
 * signing in with the same Google account keeps working.
 *
 * @example
 * await unlinkGmail(adminUser.id)
 */
export async function unlinkGmail(userId: string) {
	const rows = await db
		.select()
		.from(account)
		.where(
			and(eq(account.userId, userId), eq(account.providerId, 'google'))
		)

	const linked = rows.filter(row =>
		splitScopes(row.scope).includes(GMAIL_SEND_SCOPE)
	)

	for (const row of linked) {
		await revokeGrant(row.id)

		const remaining = splitScopes(row.scope).filter(
			scope => scope !== GMAIL_SEND_SCOPE
		)
		await db
			.update(account)
			.set({
				scope: remaining.length > 0 ? remaining.join(',') : null,
				accessToken: null,
				refreshToken: null,
				accessTokenExpiresAt: null,
				refreshTokenExpiresAt: null
			})
			.where(eq(account.id, row.id))
	}

	return linked.length
}

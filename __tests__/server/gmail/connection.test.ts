import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
	const calls: { op: string; args: unknown[] }[] = []
	const state = { rows: [] as unknown[] }

	function chain(op: string) {
		const target: Record<string, unknown> = {}
		const proxy: unknown = new Proxy(target, {
			get: (_, key) => {
				if (key === 'then') {
					return (resolve: (value: unknown) => void) =>
						resolve(op === 'select' ? state.rows : [])
				}
				return (...args: unknown[]) => {
					calls.push({ op: `${op}.${String(key)}`, args })
					return proxy
				}
			}
		})
		return proxy
	}

	return {
		calls,
		state,
		env: {
			GOOGLE_CLIENT_ID: 'id' as string | undefined,
			GOOGLE_CLIENT_SECRET: 'secret' as string | undefined
		},
		getAdminSessionUser: vi.fn(),
		getAccessToken: vi.fn(),
		db: {
			select: () => chain('select'),
			update: () => chain('update')
		}
	}
})

vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('@/server/env', () => ({ env: mocks.env }))
vi.mock('@/server/db/connection', () => ({ db: mocks.db }))
vi.mock('@/server/auth', () => ({
	auth: { api: { getAccessToken: mocks.getAccessToken } }
}))
vi.mock('@/utils/is-admin', () => ({
	getAdminSessionUser: mocks.getAdminSessionUser
}))

import {
	GMAIL_SEND_SCOPE,
	getGmailStatus,
	resolveGmailConnection,
	unlinkGmail
} from '@/server/gmail/connection'

function idToken(claims: object) {
	const payload = btoa(JSON.stringify(claims))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
	return `header.${payload}.signature`
}

const GOOD_ID_TOKEN = idToken({
	email: 'Remco@Gmail.com',
	name: ' Remco ',
	email_verified: true
})

function account(overrides: Record<string, unknown> = {}) {
	return {
		id: 'acc1',
		userId: 'u1',
		providerId: 'google',
		scope: `openid,email,${GMAIL_SEND_SCOPE}`,
		idToken: GOOD_ID_TOKEN,
		...overrides
	}
}

function liveTokens(overrides: Record<string, unknown> = {}) {
	return {
		accessToken: 'access',
		idToken: GOOD_ID_TOKEN,
		scopes: ['openid', GMAIL_SEND_SCOPE],
		accessTokenExpiresAt: new Date(Date.now() + 3_600_000),
		...overrides
	}
}

describe('resolveGmailConnection', () => {
	beforeEach(() => {
		mocks.calls.length = 0
		mocks.env.GOOGLE_CLIENT_ID = 'id'
		mocks.env.GOOGLE_CLIENT_SECRET = 'secret'
		mocks.state.rows = [account()]
		mocks.getAdminSessionUser.mockReset().mockResolvedValue({ id: 'u1' })
		mocks.getAccessToken.mockReset().mockResolvedValue(liveTokens())
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('reports not_configured without Google credentials and checks nothing else', async () => {
		mocks.env.GOOGLE_CLIENT_SECRET = undefined

		expect(await resolveGmailConnection()).toEqual({
			state: 'not_configured',
			email: null
		})
		expect(mocks.getAdminSessionUser).not.toHaveBeenCalled()
	})

	it('is disconnected without a real admin session', async () => {
		mocks.getAdminSessionUser.mockResolvedValue(null)

		expect(await resolveGmailConnection()).toEqual({
			state: 'disconnected',
			email: null
		})
		expect(mocks.getAccessToken).not.toHaveBeenCalled()
	})

	it('is disconnected when no Google account holds the send scope', async () => {
		mocks.state.rows = [account({ scope: 'openid,email' })]

		expect(await resolveGmailConnection()).toEqual({
			state: 'disconnected',
			email: null
		})
		expect(mocks.getAccessToken).not.toHaveBeenCalled()
	})

	it('connects with the verified lowercase address, trimmed name and token', async () => {
		expect(await resolveGmailConnection()).toEqual({
			state: 'connected',
			email: 'remco@gmail.com',
			name: 'Remco',
			accessToken: 'access'
		})
		expect(mocks.getAccessToken.mock.calls[0][0].body).toEqual({
			accountId: 'acc1'
		})
	})

	it('accepts a space separated scope string', async () => {
		mocks.state.rows = [account({ scope: `openid ${GMAIL_SEND_SCOPE}` })]

		expect((await resolveGmailConnection()).state).toBe('connected')
	})

	it('needs reauth when the access token is expired or about to expire', async () => {
		mocks.getAccessToken.mockResolvedValue(
			liveTokens({ accessTokenExpiresAt: new Date(Date.now() + 1000) })
		)

		expect(await resolveGmailConnection()).toEqual({
			state: 'needs_reauth',
			email: 'remco@gmail.com'
		})
	})

	it('needs reauth when no access token comes back', async () => {
		mocks.getAccessToken.mockResolvedValue(
			liveTokens({ accessToken: undefined })
		)

		expect((await resolveGmailConnection()).state).toBe('needs_reauth')
	})

	it('needs reauth when the id token has no verified email', async () => {
		const unverified = idToken({
			email: 'a@b.com',
			email_verified: false
		})
		mocks.getAccessToken.mockResolvedValue(
			liveTokens({ idToken: unverified })
		)
		mocks.state.rows = [account({ idToken: unverified })]

		expect(await resolveGmailConnection()).toEqual({
			state: 'needs_reauth',
			email: null
		})
	})

	it('treats a garbage id token as no email', async () => {
		mocks.getAccessToken.mockResolvedValue(
			liveTokens({ idToken: 'not-a-jwt' })
		)

		expect(await resolveGmailConnection()).toEqual({
			state: 'needs_reauth',
			email: null
		})
	})

	it('is disconnected when the live token lost the send scope', async () => {
		mocks.getAccessToken.mockResolvedValue(
			liveTokens({ scopes: ['openid'] })
		)

		expect(await resolveGmailConnection()).toEqual({
			state: 'disconnected',
			email: 'remco@gmail.com'
		})
	})

	it('needs reauth with the stored email when the refresh throws', async () => {
		mocks.getAccessToken.mockRejectedValue(new Error('invalid_grant'))

		expect(await resolveGmailConnection()).toEqual({
			state: 'needs_reauth',
			email: 'remco@gmail.com'
		})
	})
})

describe('getGmailStatus', () => {
	beforeEach(() => {
		mocks.state.rows = [account()]
		mocks.env.GOOGLE_CLIENT_ID = 'id'
		mocks.env.GOOGLE_CLIENT_SECRET = 'secret'
		mocks.getAdminSessionUser.mockReset().mockResolvedValue({ id: 'u1' })
		mocks.getAccessToken.mockReset().mockResolvedValue(liveTokens())
	})

	it('reports connected without leaking the token', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('{}', { status: 200 })
		)

		const status = await getGmailStatus()

		expect(status).toEqual({ state: 'connected', email: 'remco@gmail.com' })
		expect(JSON.stringify(status)).not.toContain('access')
	})

	it('downgrades to needs_reauth when Google says the token is revoked', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('{}', { status: 400 })
		)

		expect(await getGmailStatus()).toEqual({
			state: 'needs_reauth',
			email: 'remco@gmail.com'
		})
	})

	it('stays connected when the token check fails on the network', async () => {
		vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))

		expect((await getGmailStatus()).state).toBe('connected')
	})

	it('does not call Google when not connected', async () => {
		mocks.getAdminSessionUser.mockResolvedValue(null)
		const fetchSpy = vi.spyOn(globalThis, 'fetch')

		expect((await getGmailStatus()).state).toBe('disconnected')
		expect(fetchSpy).not.toHaveBeenCalled()
	})
})

describe('unlinkGmail', () => {
	beforeEach(() => {
		mocks.calls.length = 0
		mocks.getAccessToken.mockReset().mockResolvedValue(liveTokens())
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	function updates() {
		return mocks.calls
			.filter(call => call.op === 'update.set')
			.map(call => call.args[0])
	}

	it('revokes the grant, drops only the send scope and clears tokens', async () => {
		mocks.state.rows = [account()]
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response('{}', { status: 200 }))

		expect(await unlinkGmail('u1')).toBe(1)

		expect(fetchSpy.mock.calls[0][0]).toBe(
			'https://oauth2.googleapis.com/revoke'
		)
		expect(updates()).toEqual([
			{
				scope: 'openid,email',
				accessToken: null,
				refreshToken: null,
				accessTokenExpiresAt: null,
				refreshTokenExpiresAt: null
			}
		])
	})

	it('stores a null scope when the send scope was the only one', async () => {
		mocks.state.rows = [account({ scope: GMAIL_SEND_SCOPE })]
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))

		await unlinkGmail('u1')

		expect((updates()[0] as { scope: unknown }).scope).toBeNull()
	})

	it('still clears local state when the revoke fails', async () => {
		mocks.state.rows = [account()]
		vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))

		expect(await unlinkGmail('u1')).toBe(1)
		expect(updates()).toHaveLength(1)
	})

	it('skips accounts without the send scope', async () => {
		mocks.state.rows = [account({ scope: 'openid,email' })]
		const fetchSpy = vi.spyOn(globalThis, 'fetch')

		expect(await unlinkGmail('u1')).toBe(0)
		expect(updates()).toHaveLength(0)
		expect(fetchSpy).not.toHaveBeenCalled()
	})
})

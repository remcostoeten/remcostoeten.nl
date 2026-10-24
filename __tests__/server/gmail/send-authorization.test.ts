import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoredReply } from '@/server/gmail/reply-service'

const SCOPE = 'https://www.googleapis.com/auth/gmail.send'
const KEY = '3b241101-e2bb-4255-8caf-4136c566a962'
const ID_TOKEN = `h.${btoa(
	JSON.stringify({ email: 'remco@gmail.com', email_verified: true })
)}.s`

const mocks = vi.hoisted(() => {
	const state = {
		session: null as null | {
			user: { id: string; email: string; role?: string }
		},
		submissions: {} as Record<
			string,
			{ id: string; email: string; subject: string | null }
		>
	}

	function rowsChain(rows: unknown[]) {
		const target: Record<string, unknown> = {}
		const proxy: unknown = new Proxy(target, {
			get: (_, key) => {
				if (key === 'then') {
					return (resolve: (value: unknown) => void) => resolve(rows)
				}
				return () => proxy
			}
		})
		return proxy
	}

	return {
		state,
		env: {
			DEV_OPEN_ADMIN: 'true' as string | undefined,
			ADMIN_EMAIL: 'remcostoeten@gmail.com' as string | undefined,
			BETTER_AUTH_URL: 'http://localhost:3000',
			GOOGLE_CLIENT_ID: 'id',
			GOOGLE_CLIENT_SECRET: 'secret'
		},
		getSession: vi.fn(async () => state.session),
		getAccessToken: vi.fn(),
		sendGmailMessage: vi.fn(),
		revalidatePath: vi.fn(),
		inserted: [] as StoredReply[],
		store: {
			findSubmission: vi.fn(
				async (id: string) => state.submissions[id] ?? null
			),
			findSentReplies: vi.fn(async () => []),
			findReplyById: vi.fn(async () => null),
			findReplyByKey: vi.fn(async () => null),
			countRecentReplies: vi.fn(async () => 0),
			insertPending: vi.fn(async (reply: StoredReply) => reply),
			markSent: vi.fn(async () => {}),
			markUnsent: vi.fn(async () => {})
		},
		db: {
			select: () =>
				rowsChain([
					{
						id: 'acc1',
						userId: 'u1',
						providerId: 'google',
						scope: SCOPE,
						idToken: ID_TOKEN
					}
				])
		}
	}
})

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('@/server/env', () => ({ env: mocks.env }))
vi.mock('@/server/db/connection', () => ({ db: mocks.db }))
vi.mock('@/server/auth', () => ({
	auth: {
		api: {
			getSession: mocks.getSession,
			getAccessToken: mocks.getAccessToken
		}
	}
}))
vi.mock('@/server/gmail/api', () => ({
	sendGmailMessage: mocks.sendGmailMessage
}))
vi.mock('@/server/gmail/reply-store', () => ({ replyStore: mocks.store }))

import { resolveReply, sendReply } from '@/server/actions/contact/reply'
import { resolveGmailConnection } from '@/server/gmail/connection'
import { getAdminSessionUser, isAdmin } from '@/utils/is-admin'

function decodeRaw(raw: string) {
	return Buffer.from(raw, 'base64url').toString('utf8')
}

describe('DEV_OPEN_ADMIN never authorizes a send', () => {
	beforeEach(() => {
		mocks.env.DEV_OPEN_ADMIN = 'true'
		mocks.state.session = null
		mocks.state.submissions = {
			s1: { id: 's1', email: 'visitor@example.com', subject: 'Quote' }
		}
		mocks.getSession.mockClear()
		mocks.getAccessToken.mockReset().mockResolvedValue({
			accessToken: 'access',
			idToken: ID_TOKEN,
			scopes: [SCOPE],
			accessTokenExpiresAt: new Date(Date.now() + 3_600_000)
		})
		mocks.sendGmailMessage.mockReset().mockResolvedValue({
			kind: 'sent',
			messageId: 'gm1',
			threadId: 'gt1'
		})
		for (const fn of Object.values(mocks.store)) fn.mockClear()
	})

	it('opens the admin pages but gives no session user', async () => {
		expect(await isAdmin()).toBe(true)
		expect(await getAdminSessionUser()).toBeNull()
	})

	it('refuses sendReply without a session and sends nothing', async () => {
		const result = await sendReply('s1', KEY, 'Hello')

		expect(result).toEqual({ status: 'unauthorized' })
		expect(mocks.sendGmailMessage).not.toHaveBeenCalled()
		expect(mocks.store.insertPending).not.toHaveBeenCalled()
		expect(mocks.store.findSubmission).not.toHaveBeenCalled()
		expect(mocks.getAccessToken).not.toHaveBeenCalled()
	})

	it('refuses resolveReply without a session and writes nothing', async () => {
		expect(await resolveReply('r1', 'sent')).toEqual({
			status: 'unauthorized'
		})
		expect(mocks.store.markSent).not.toHaveBeenCalled()
		expect(mocks.store.markUnsent).not.toHaveBeenCalled()
	})

	it('reports the Gmail connection as disconnected without a session', async () => {
		expect(await resolveGmailConnection()).toEqual({
			state: 'disconnected',
			email: null
		})
		expect(mocks.getAccessToken).not.toHaveBeenCalled()
	})

	it('ignores a session user who is not an admin even with the flag on', async () => {
		mocks.state.session = {
			user: { id: 'u2', email: 'stranger@example.com' }
		}

		expect(await sendReply('s1', KEY, 'Hello')).toEqual({
			status: 'unauthorized'
		})
		expect(mocks.sendGmailMessage).not.toHaveBeenCalled()
	})

	it('still sends for a real admin session, with the flag on or off', async () => {
		mocks.state.session = {
			user: { id: 'u1', email: 'remcostoeten@gmail.com' }
		}

		for (const flag of ['true', 'false', undefined]) {
			mocks.env.DEV_OPEN_ADMIN = flag
			mocks.sendGmailMessage.mockClear()
			const result = await sendReply('s1', crypto.randomUUID(), 'Hello')

			expect(result.status).toBe('sent')
			expect(mocks.sendGmailMessage).toHaveBeenCalledTimes(1)
		}
	})
})

describe('the recipient always comes from the stored submission', () => {
	beforeEach(() => {
		mocks.env.DEV_OPEN_ADMIN = 'false'
		mocks.state.session = {
			user: { id: 'u1', email: 'remcostoeten@gmail.com' }
		}
		mocks.state.submissions = {
			s1: { id: 's1', email: 'visitor@example.com', subject: 'Quote' },
			s2: { id: 's2', email: 'other@example.com', subject: null }
		}
		mocks.getAccessToken.mockReset().mockResolvedValue({
			accessToken: 'access',
			idToken: ID_TOKEN,
			scopes: [SCOPE],
			accessTokenExpiresAt: new Date(Date.now() + 3_600_000)
		})
		mocks.sendGmailMessage.mockReset().mockResolvedValue({
			kind: 'sent',
			messageId: 'gm1',
			threadId: 'gt1'
		})
		for (const fn of Object.values(mocks.store)) fn.mockClear()
	})

	it('addresses the email to the stored recipient, ignoring extra client fields', async () => {
		const extra = ['to', 'cc', 'bcc', 'toEmail', 'from', 'recipient']
		const sendWithExtras = sendReply as unknown as (
			...args: unknown[]
		) => ReturnType<typeof sendReply>

		await sendWithExtras('s1', KEY, 'Hello', 'attacker@example.com', {
			...Object.fromEntries(
				extra.map(name => [name, 'attacker@example.com'])
			)
		})

		const raw = decodeRaw(mocks.sendGmailMessage.mock.calls[0][1])
		expect(raw).toContain('To: visitor@example.com')
		expect(raw).not.toContain('attacker@example.com')
		expect(mocks.store.insertPending.mock.calls[0][0]).toMatchObject({
			toEmail: 'visitor@example.com',
			fromEmail: 'remco@gmail.com'
		})
	})

	it('does not let the body smuggle in recipients through headers', async () => {
		await sendReply(
			's1',
			KEY,
			'Hi\r\nBcc: attacker@example.com\r\nTo: attacker@example.com'
		)

		const raw = decodeRaw(mocks.sendGmailMessage.mock.calls[0][1])
		const headerBlock = raw.split(/\r?\n\r?\n/)[0]
		expect(headerBlock).not.toContain('attacker@example.com')
		expect(headerBlock).toContain('To: visitor@example.com')
	})

	it('uses the recipient of the submission id it was asked about', async () => {
		await sendReply('s2', crypto.randomUUID(), 'Hello')

		const raw = decodeRaw(mocks.sendGmailMessage.mock.calls[0][1])
		expect(raw).toContain('To: other@example.com')
		expect(raw).not.toContain('visitor@example.com')
	})

	it('sends nothing for an unknown submission, whatever the client supplies', async () => {
		const result = await sendReply('nope', KEY, 'Hello')

		expect(result).toEqual({ status: 'not_found' })
		expect(mocks.sendGmailMessage).not.toHaveBeenCalled()
		expect(mocks.store.insertPending).not.toHaveBeenCalled()
	})
})

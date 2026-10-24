import { describe, expect, it } from 'vitest'
import { classifyGmailResponse, sendGmailMessage } from '@/server/gmail/api'

function jsonResponse(status: number, body: object) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	})
}

describe('classifyGmailResponse', () => {
	it('reports the Gmail ids on success', () => {
		expect(
			classifyGmailResponse(200, { id: 'm1', threadId: 't1' })
		).toEqual({
			kind: 'sent',
			messageId: 'm1',
			threadId: 't1'
		})
	})

	it('treats a success without ids as uncertain', () => {
		expect(classifyGmailResponse(200, {}).kind).toBe('uncertain')
	})

	it('maps credential problems to auth_error', () => {
		expect(classifyGmailResponse(401, {}).kind).toBe('auth_error')
		expect(classifyGmailResponse(403, {}).kind).toBe('auth_error')
	})

	it('maps quota problems to rate_limited, including 403 rate reasons', () => {
		expect(classifyGmailResponse(429, {}).kind).toBe('rate_limited')
		expect(
			classifyGmailResponse(403, {
				error: { errors: [{ reason: 'userRateLimitExceeded' }] }
			}).kind
		).toBe('rate_limited')
	})

	it('reports a disabled API or missing scope instead of asking to reauthorize', () => {
		const outcome = classifyGmailResponse(403, {
			error: {
				message: 'Gmail API has not been used in project 1',
				errors: [{ reason: 'accessNotConfigured' }]
			}
		})

		expect(outcome).toEqual({
			kind: 'rejected',
			message: 'Gmail API has not been used in project 1'
		})
		expect(
			classifyGmailResponse(403, {
				error: { errors: [{ reason: 'insufficientPermissions' }] }
			}).kind
		).toBe('rejected')
	})

	it('treats server errors as uncertain, never as a definite failure', () => {
		expect(classifyGmailResponse(500, {}).kind).toBe('uncertain')
		expect(classifyGmailResponse(503, {}).kind).toBe('uncertain')
	})

	it('maps other client errors to rejected', () => {
		expect(
			classifyGmailResponse(400, {
				error: { message: 'Invalid To header' }
			})
		).toEqual({ kind: 'rejected', message: 'Invalid To header' })
	})
})

describe('sendGmailMessage', () => {
	it('posts the raw message with a bearer token and thread id', async () => {
		const calls: { url: string; init: RequestInit }[] = []
		const fakeFetch: typeof fetch = async (url, init) => {
			calls.push({ url: String(url), init: init ?? {} })
			return jsonResponse(200, { id: 'm1', threadId: 't1' })
		}

		const outcome = await sendGmailMessage('token', 'RAW', 't0', fakeFetch)

		expect(outcome.kind).toBe('sent')
		const [captured] = calls
		expect(captured.url).toBe(
			'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
		)
		const headers = new Headers(captured.init.headers)
		expect(headers.get('Authorization')).toBe('Bearer token')
		expect(JSON.parse(String(captured.init.body))).toEqual({
			raw: 'RAW',
			threadId: 't0'
		})
	})

	it('omits the thread id for a first reply', async () => {
		let body = ''
		const fakeFetch: typeof fetch = async (_url, init) => {
			body = String(init?.body)
			return jsonResponse(200, { id: 'm1', threadId: 't1' })
		}

		await sendGmailMessage('token', 'RAW', null, fakeFetch)
		expect(JSON.parse(body)).toEqual({ raw: 'RAW' })
	})

	it('reports a network failure as uncertain and does not retry', async () => {
		let calls = 0
		const fakeFetch: typeof fetch = async () => {
			calls += 1
			throw new TypeError('network down')
		}

		const outcome = await sendGmailMessage('token', 'RAW', null, fakeFetch)
		expect(outcome.kind).toBe('uncertain')
		expect(calls).toBe(1)
	})
})

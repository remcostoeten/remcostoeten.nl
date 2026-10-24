const SEND_ENDPOINT =
	'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
const SEND_TIMEOUT_MS = 15_000

export type GmailSendOutcome =
	| { kind: 'sent'; messageId: string; threadId: string }
	| { kind: 'auth_error' }
	| { kind: 'rate_limited' }
	| { kind: 'rejected'; message: string }
	| { kind: 'uncertain'; message: string }

type GmailErrorBody = {
	error?: {
		message?: string
		errors?: { reason?: string }[]
	}
}

type GmailSentBody = {
	id?: string
	threadId?: string
}

const RATE_LIMIT_REASONS = new Set([
	'rateLimitExceeded',
	'userRateLimitExceeded',
	'dailyLimitExceeded',
	'quotaExceeded'
])

const CONFIGURATION_REASONS = new Set([
	'accessNotConfigured',
	'insufficientPermissions'
])

function readReasons(body: GmailErrorBody) {
	return (body.error?.errors ?? []).map(item => item.reason ?? '')
}

/**
 * @name classifyGmailResponse
 * @description Maps a Gmail send response to one outcome. Only responses that
 * prove Gmail did not accept the message count as failures. A server error or
 * an unreadable success body is uncertain, because the message may have been
 * sent.
 *
 * @example
 * const outcome = classifyGmailResponse(response.status, await response.json())
 */
export function classifyGmailResponse(
	status: number,
	body: GmailErrorBody & GmailSentBody
): GmailSendOutcome {
	if (status >= 200 && status < 300) {
		if (body.id && body.threadId) {
			return { kind: 'sent', messageId: body.id, threadId: body.threadId }
		}
		return {
			kind: 'uncertain',
			message: 'Gmail accepted the request but returned no message ID'
		}
	}

	const reasons = readReasons(body)

	if (
		status === 429 ||
		reasons.some(reason => RATE_LIMIT_REASONS.has(reason))
	) {
		return { kind: 'rate_limited' }
	}
	if (reasons.some(reason => CONFIGURATION_REASONS.has(reason))) {
		return {
			kind: 'rejected',
			message:
				body.error?.message ?? `Gmail rejected the request (${status})`
		}
	}
	if (status === 401 || status === 403) return { kind: 'auth_error' }
	if (status >= 500) {
		return { kind: 'uncertain', message: `Gmail returned status ${status}` }
	}

	return {
		kind: 'rejected',
		message: body.error?.message ?? `Gmail rejected the message (${status})`
	}
}

/**
 * @name sendGmailMessage
 * @description Sends a raw base64url MIME message through the Gmail API as the
 * owner of the access token. A timeout or network error is reported as
 * uncertain and never retried, because Gmail may already have accepted it.
 *
 * @example
 * const outcome = await sendGmailMessage(accessToken, raw, threadId)
 */
export async function sendGmailMessage(
	accessToken: string,
	raw: string,
	threadId: string | null,
	fetchImpl: typeof fetch = fetch
): Promise<GmailSendOutcome> {
	try {
		const response = await fetchImpl(SEND_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(threadId ? { raw, threadId } : { raw }),
			signal: AbortSignal.timeout(SEND_TIMEOUT_MS)
		})
		const body: GmailErrorBody & GmailSentBody = await response
			.json()
			.catch(() => ({}))

		return classifyGmailResponse(response.status, body)
	} catch {
		return {
			kind: 'uncertain',
			message: 'The request to Gmail timed out or failed in transit'
		}
	}
}

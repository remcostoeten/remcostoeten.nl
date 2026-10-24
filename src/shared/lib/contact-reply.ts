import { z } from 'zod'

export const REPLY_MAX_LENGTH = 5000
export const DEFAULT_REPLY_SUBJECT = 'Re: Your message to Remco'

const SUBJECT_MAX_LENGTH = 200

const TAB = 9
const LINE_FEED = 10
const CARRIAGE_RETURN = 13
const SPACE = 32
const DELETE = 127

function isControl(character: string) {
	const code = character.charCodeAt(0)
	return code < SPACE || code === DELETE
}

function stripBodyControls(value: string) {
	return Array.from(value)
		.filter(character => {
			const code = character.charCodeAt(0)
			const keep =
				code === TAB || code === LINE_FEED || code === CARRIAGE_RETURN
			return keep || !isControl(character)
		})
		.join('')
}

export const replyInputSchema = z.object({
	submissionId: z.string().min(1).max(100),
	idempotencyKey: z.string().uuid(),
	body: z
		.string()
		.transform(value =>
			stripBodyControls(value).replace(/\r\n?/g, '\n').trim()
		)
		.pipe(
			z
				.string()
				.min(1, 'Write a reply before sending')
				.max(
					REPLY_MAX_LENGTH,
					`Replies are limited to ${REPLY_MAX_LENGTH} characters`
				)
		)
})

/**
 * @name sanitizeHeaderValue
 * @description Collapses every whitespace and control character run into a
 * single space and trims the result, so a value can never end a header line.
 *
 * @example
 * sanitizeHeaderValue('Hi\r\nBcc: x@y.z') // "Hi Bcc: x@y.z"
 */
export function sanitizeHeaderValue(value: string) {
	return Array.from(value)
		.map(character =>
			/\s/.test(character) || isControl(character) ? ' ' : character
		)
		.join('')
		.replace(/ {2,}/g, ' ')
		.trim()
}

/**
 * @name buildReplySubject
 * @description Builds the subject of a reply. A thread that already has a
 * reply keeps its subject. Otherwise the visitor's subject gets a "Re: "
 * prefix, falling back to a default when they left it empty.
 *
 * @example
 * buildReplySubject('Quote', null) // "Re: Quote"
 */
export function buildReplySubject(
	submissionSubject: string | null,
	threadSubject: string | null
) {
	if (threadSubject) return threadSubject

	const clean = sanitizeHeaderValue(submissionSubject ?? '').slice(
		0,
		SUBJECT_MAX_LENGTH
	)
	if (!clean) return DEFAULT_REPLY_SUBJECT
	return /^re:/i.test(clean) ? clean : `Re: ${clean}`
}

export const SNIPPET_TITLE_MAX_LENGTH = 60
export const SIGNATURE_MAX_LENGTH = 500
export const TEMPLATE_LIMIT = 20

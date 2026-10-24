import { describe, expect, it } from 'vitest'
import {
	DEFAULT_REPLY_SUBJECT,
	REPLY_MAX_LENGTH,
	buildReplySubject,
	replyInputSchema,
	sanitizeHeaderValue
} from '@/shared/lib/contact-reply'

const KEY = '3b241101-e2bb-4255-8caf-4136c566a962'

describe('sanitizeHeaderValue', () => {
	it('flattens line breaks so a header cannot be injected', () => {
		expect(sanitizeHeaderValue('Hi\r\nBcc: evil@example.com')).toBe(
			'Hi Bcc: evil@example.com'
		)
		expect(sanitizeHeaderValue('a b\u0000c')).toBe('a b c')
	})
})

describe('buildReplySubject', () => {
	it('prefixes the visitor subject with Re:', () => {
		expect(buildReplySubject('Quote', null)).toBe('Re: Quote')
		expect(buildReplySubject('re: Quote', null)).toBe('re: Quote')
	})

	it('falls back to the default when the subject is empty', () => {
		expect(buildReplySubject(null, null)).toBe(DEFAULT_REPLY_SUBJECT)
		expect(buildReplySubject('  \r\n ', null)).toBe(DEFAULT_REPLY_SUBJECT)
	})

	it('keeps the subject of an existing thread', () => {
		expect(buildReplySubject('Other', 'Re: Quote')).toBe('Re: Quote')
	})

	it('sanitizes and caps a hostile stored subject', () => {
		const subject = buildReplySubject(
			`Hi\r\nBcc: x@y.z${'a'.repeat(400)}`,
			null
		)
		expect(subject).not.toMatch(/[\r\n]/)
		expect(subject.length).toBeLessThanOrEqual(204)
	})
})

describe('replyInputSchema', () => {
	it('trims, normalizes newlines and strips control characters', () => {
		const result = replyInputSchema.parse({
			submissionId: 's1',
			idempotencyKey: KEY,
			body: '  Hello\r\nworld\u0000\u0007  '
		})
		expect(result.body).toBe('Hello\nworld')
	})

	it('rejects empty, oversized and non-uuid input', () => {
		expect(
			replyInputSchema.safeParse({
				submissionId: 's1',
				idempotencyKey: KEY,
				body: '   '
			}).success
		).toBe(false)
		expect(
			replyInputSchema.safeParse({
				submissionId: 's1',
				idempotencyKey: KEY,
				body: 'a'.repeat(REPLY_MAX_LENGTH + 1)
			}).success
		).toBe(false)
		expect(
			replyInputSchema.safeParse({
				submissionId: 's1',
				idempotencyKey: 'not-a-uuid',
				body: 'Hi'
			}).success
		).toBe(false)
	})
})

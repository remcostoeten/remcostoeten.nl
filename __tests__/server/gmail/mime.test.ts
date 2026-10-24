import { describe, expect, it } from 'vitest'
import { buildMimeMessage, toBase64Url } from '@/server/gmail/mime'

const base = {
	from: 'remco@gmail.com',
	to: 'visitor@example.com',
	subject: 'Re: Quote',
	body: 'Hello there',
	messageId: '<abc@remcostoeten.nl>',
	date: new Date('2026-10-24T12:00:00Z'),
	inReplyTo: null,
	references: []
}

function decodeBody(mime: string) {
	const encoded = mime.split('\r\n\r\n')[1].replace(/\r\n/g, '')
	return new TextDecoder().decode(
		Uint8Array.from(atob(encoded), character => character.charCodeAt(0))
	)
}

describe('buildMimeMessage', () => {
	it('writes the required headers and a base64 UTF-8 body', () => {
		const mime = buildMimeMessage(base)
		expect(mime).toContain('From: remco@gmail.com\r\n')
		expect(mime).toContain('To: visitor@example.com\r\n')
		expect(mime).toContain('Subject: Re: Quote\r\n')
		expect(mime).toContain('Message-ID: <abc@remcostoeten.nl>\r\n')
		expect(mime).toContain('Content-Type: text/plain; charset="UTF-8"')
		expect(mime).toContain('Content-Transfer-Encoding: base64')
		expect(mime).not.toContain('In-Reply-To')
		expect(decodeBody(mime)).toBe('Hello there')
	})

	it('adds threading headers for a follow-up reply', () => {
		const mime = buildMimeMessage({
			...base,
			inReplyTo: '<prev@remcostoeten.nl>',
			references: ['<first@remcostoeten.nl>', '<prev@remcostoeten.nl>']
		})
		expect(mime).toContain('In-Reply-To: <prev@remcostoeten.nl>\r\n')
		expect(mime).toContain(
			'References: <first@remcostoeten.nl> <prev@remcostoeten.nl>\r\n'
		)
	})

	it('encodes non-ASCII subjects and bodies', () => {
		const mime = buildMimeMessage({
			...base,
			subject: 'Re: Café ✓',
			body: 'Grüße ✓'
		})
		expect(mime).toMatch(/Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=/)
		expect(decodeBody(mime)).toBe('Grüße ✓')
	})

	it('flattens line breaks in the subject so no header can be injected', () => {
		const mime = buildMimeMessage({
			...base,
			subject: 'Hi\r\nBcc: evil@example.com'
		})
		expect(mime).not.toMatch(/\r\nBcc:/)
	})

	it('rejects recipients that could add headers or recipients', () => {
		for (const to of [
			'a@example.com\r\nBcc: b@example.com',
			'a@example.com, b@example.com',
			'Name <a@example.com>',
			'not-an-email'
		]) {
			expect(() => buildMimeMessage({ ...base, to })).toThrow()
		}
	})

	it('rejects a malformed Message-ID', () => {
		expect(() =>
			buildMimeMessage({ ...base, messageId: 'abc@remcostoeten.nl' })
		).toThrow()
	})

	it('uses CRLF line endings in the body', () => {
		const mime = buildMimeMessage({ ...base, body: 'a\nb' })
		expect(decodeBody(mime)).toBe('a\r\nb')
	})
})

describe('toBase64Url', () => {
	it('uses the URL alphabet without padding', () => {
		const encoded = toBase64Url('???>>>~~~')
		expect(encoded).not.toMatch(/[+/=]/)
		expect(encoded).toBe('Pz8_Pj4-fn5-')
	})
})

describe('buildMimeMessage display name', () => {
	it('quotes an ASCII display name', () => {
		const mime = buildMimeMessage({
			...base,
			fromName: 'Remco "R" Stoeten'
		})
		expect(mime).toContain(
			'From: "Remco \\"R\\" Stoeten" <remco@gmail.com>\r\n'
		)
	})

	it('encodes a non-ASCII display name', () => {
		const mime = buildMimeMessage({ ...base, fromName: 'Zoë' })
		expect(mime).toMatch(
			/From: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?= <remco@gmail.com>\r\n/
		)
	})

	it('cannot inject a header through the display name', () => {
		const mime = buildMimeMessage({
			...base,
			fromName: 'Remco\r\nBcc: evil@example.com'
		})
		expect(mime).not.toMatch(/\r\nBcc:/)
	})

	it('uses the bare address when the name is empty', () => {
		expect(buildMimeMessage({ ...base, fromName: '  ' })).toContain(
			'From: remco@gmail.com\r\n'
		)
	})
})

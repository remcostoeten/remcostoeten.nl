import { sanitizeHeaderValue } from '@/shared/lib/contact-reply'

type MimeMessage = {
	from: string
	fromName?: string | null
	to: string
	subject: string
	body: string
	messageId: string
	date: Date
	inReplyTo: string | null
	references: string[]
}

const ADDRESS =
	/^[A-Za-z0-9._%+'!#$&*/=?^`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/
const MESSAGE_ID = /^<[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+>$/
const ENCODED_WORD_BYTES = 42
const DISPLAY_NAME_MAX_LENGTH = 80

function toBase64(bytes: Uint8Array) {
	let binary = ''
	for (let index = 0; index < bytes.length; index += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
	}
	return btoa(binary)
}

/**
 * @name toBase64Url
 * @description Encodes a string as UTF-8 and then as unpadded base64url, the
 * format the Gmail API expects for the raw message field.
 *
 * @example
 * const raw = toBase64Url(mimeMessage)
 */
export function toBase64Url(value: string) {
	return toBase64(new TextEncoder().encode(value))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

function wrapBase64(value: string) {
	return value.replace(/(.{76})/g, '$1\r\n').replace(/\r\n$/, '')
}

function assertAddress(address: string) {
	if (address.length > 254 || !ADDRESS.test(address)) {
		throw new Error('Invalid email address')
	}
	return address
}

function assertMessageId(messageId: string) {
	if (!MESSAGE_ID.test(messageId)) throw new Error('Invalid Message-ID')
	return messageId
}

function isPrintableAscii(value: string) {
	return /^[\x20-\x7E]*$/.test(value)
}

function encodeWords(clean: string) {
	const encoder = new TextEncoder()
	const words: string[] = []
	let chunk = ''

	for (const character of clean) {
		const next = chunk + character
		if (chunk && encoder.encode(next).length > ENCODED_WORD_BYTES) {
			words.push(chunk)
			chunk = character
		} else {
			chunk = next
		}
	}
	if (chunk) words.push(chunk)

	return words
		.map(word => `=?UTF-8?B?${toBase64(encoder.encode(word))}?=`)
		.join('\r\n ')
}

function encodeSubject(subject: string) {
	const clean = sanitizeHeaderValue(subject)
	if (isPrintableAscii(clean)) return clean
	return encodeWords(clean)
}

function formatFrom(address: string, displayName: string | null | undefined) {
	const name = sanitizeHeaderValue(displayName ?? '').slice(
		0,
		DISPLAY_NAME_MAX_LENGTH
	)
	const safeAddress = assertAddress(address)
	if (!name) return safeAddress

	const phrase = isPrintableAscii(name)
		? `"${name.replace(/["\\]/g, '\\$&')}"`
		: encodeWords(name)
	return `${phrase} <${safeAddress}>`
}

/**
 * @name buildMimeMessage
 * @description Builds an RFC 5322 plain-text email with a UTF-8 base64 body.
 * Addresses and message IDs are validated and the subject is sanitised, so
 * no input can add a header or a recipient.
 *
 * @example
 * const mime = buildMimeMessage({ from, to, subject, body, messageId, date,
 *   inReplyTo: null, references: [] })
 */
export function buildMimeMessage(message: MimeMessage) {
	const headers = [
		`From: ${formatFrom(message.from, message.fromName)}`,
		`To: ${assertAddress(message.to)}`,
		`Subject: ${encodeSubject(message.subject)}`,
		`Date: ${message.date.toUTCString()}`,
		`Message-ID: ${assertMessageId(message.messageId)}`
	]

	if (message.inReplyTo) {
		headers.push(`In-Reply-To: ${assertMessageId(message.inReplyTo)}`)
	}
	if (message.references.length > 0) {
		headers.push(
			`References: ${message.references.map(assertMessageId).join(' ')}`
		)
	}

	headers.push(
		'MIME-Version: 1.0',
		'Content-Type: text/plain; charset="UTF-8"',
		'Content-Transfer-Encoding: base64'
	)

	const body = message.body.replace(/\r\n?|\n/g, '\r\n')
	const encodedBody = wrapBase64(toBase64(new TextEncoder().encode(body)))

	return `${headers.join('\r\n')}\r\n\r\n${encodedBody}\r\n`
}

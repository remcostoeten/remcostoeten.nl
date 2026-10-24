import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUuid } from '@/shared/helpers/uuid'

const UUID_V4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

const realCrypto = globalThis.crypto

describe('createUuid', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('returns a version 4 UUID', () => {
		expect(createUuid()).toMatch(UUID_V4)
	})

	it('still returns one when randomUUID is unavailable', () => {
		vi.stubGlobal('crypto', {
			getRandomValues: (bytes: Uint8Array) =>
				realCrypto.getRandomValues(bytes)
		})

		expect(createUuid()).toMatch(UUID_V4)
	})
})

import { describe, expect, it } from 'vitest'
import { originForHost, swapOrigin } from '../../worker/localize'

describe('originForHost', () => {
	it('keeps .com hosts on .com', () => {
		expect(originForHost('www.remcostoeten.com')).toBe(
			'https://www.remcostoeten.com'
		)
		expect(originForHost('remcostoeten.com')).toBe(
			'https://www.remcostoeten.com'
		)
	})

	it('sends every other host to .nl', () => {
		expect(originForHost('www.remcostoeten.nl')).toBe(
			'https://www.remcostoeten.nl'
		)
		expect(originForHost('localhost')).toBe('https://www.remcostoeten.nl')
	})
})

describe('swapOrigin', () => {
	it('replaces the .nl origin and keeps the path', () => {
		expect(
			swapOrigin(
				'https://www.remcostoeten.nl/about',
				'https://www.remcostoeten.com'
			)
		).toBe('https://www.remcostoeten.com/about')
	})

	it('leaves other urls alone', () => {
		expect(
			swapOrigin('https://example.com/a', 'https://www.remcostoeten.com')
		).toBe('https://example.com/a')
	})
})

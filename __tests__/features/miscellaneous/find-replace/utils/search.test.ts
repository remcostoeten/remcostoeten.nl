import { describe, expect, it } from 'vitest'
import { DEFAULT_OPTIONS } from '@/features/miscellaneous/find-replace/constants'
import {
	applyReplacement,
	buildSearchRegex,
	findMatches,
	getLineAndColumn
} from '@/features/miscellaneous/find-replace/utils/search'
import type { TFindOptions } from '@/features/miscellaneous/find-replace/types'

function options(overrides: Partial<TFindOptions> = {}): TFindOptions {
	return { ...DEFAULT_OPTIONS, ...overrides }
}

describe('buildSearchRegex', () => {
	it('escapes special characters in literal mode', () => {
		const built = buildSearchRegex('a.b(c)', options())
		expect(built.ok).toBe(true)
		if (built.ok) expect(built.regex.test('a.b(c)')).toBe(true)
	})

	it('reports invalid regex patterns', () => {
		const built = buildSearchRegex('(unclosed', options({ regex: true }))
		expect(built.ok).toBe(false)
	})

	it('respects case sensitivity', () => {
		const insensitive = findMatches('Foo foo FOO', 'foo', options())
		const sensitive = findMatches(
			'Foo foo FOO',
			'foo',
			options({ caseSensitive: true })
		)
		expect(insensitive.ok && insensitive.matches.length).toBe(3)
		expect(sensitive.ok && sensitive.matches.length).toBe(1)
	})

	it('matches whole words only when enabled', () => {
		const result = findMatches(
			'cat category cat',
			'cat',
			options({ wholeWord: true })
		)
		expect(result.ok && result.matches.length).toBe(2)
	})
})

describe('findMatches', () => {
	it('returns no matches for an empty query', () => {
		const result = findMatches('anything', '', options())
		expect(result.ok && result.matches).toEqual([])
	})

	it('does not loop forever on zero-length regex matches', () => {
		const result = findMatches('abc', 'x*', options({ regex: true }))
		expect(result.ok).toBe(true)
	})
})

describe('applyReplacement', () => {
	it('replaces all occurrences', () => {
		const result = applyReplacement('a b a', 'a', 'x', options(), 'all')
		expect(result.ok && result.text).toBe('x b x')
		expect(result.ok && result.count).toBe(2)
	})

	it('replaces only the first occurrence', () => {
		const result = applyReplacement('a b a', 'a', 'x', options(), 'first')
		expect(result.ok && result.text).toBe('x b a')
	})

	it('replaces only the targeted match', () => {
		const result = applyReplacement('a b a', 'a', 'x', options(), {
			nth: 1
		})
		expect(result.ok && result.text).toBe('a b x')
	})

	it('replaces only the last occurrence', () => {
		const result = applyReplacement('a b a', 'a', 'x', options(), 'last')
		expect(result.ok && result.text).toBe('a b x')
	})

	it('replaces matches after a given occurrence index', () => {
		const result = applyReplacement('a a a a', 'a', 'x', options(), {
			after: 1
		})
		expect(result.ok && result.text).toBe('a a x x')
	})

	it('replaces the nth match counting from the end', () => {
		const result = applyReplacement('a b a b a', 'a', 'x', options(), {
			fromLast: 1
		})
		expect(result.ok && result.text).toBe('a b x b a')
	})

	it('replaces all matches except ones containing a substring', () => {
		const result = applyReplacement(
			'foo1 foo2 bar1',
			'\\w+',
			'X',
			options({ regex: true }),
			{ allExcept: 'bar' }
		)
		expect(result.ok && result.text).toBe('X X bar1')
	})

	it('expands capture groups in regex mode', () => {
		const result = applyReplacement(
			'john.doe@example.com',
			'(\\w+)\\.(\\w+)@',
			'$2.$1@',
			options({ regex: true }),
			'all'
		)
		expect(result.ok && result.text).toBe('doe.john@example.com')
	})

	it('keeps $1 literal outside regex mode', () => {
		const result = applyReplacement('abc', 'b', '$1', options(), 'all')
		expect(result.ok && result.text).toBe('a$1c')
	})

	it('preserves case of the matched text', () => {
		const result = applyReplacement(
			'Foo foo FOO',
			'foo',
			'bar',
			options({ preserveCase: true }),
			'all'
		)
		expect(result.ok && result.text).toBe('Bar bar BAR')
	})

	it('trims trailing whitespace when requested', () => {
		const result = applyReplacement(
			'a   \nb\t\n',
			'a',
			'x',
			options({ trimWhitespace: true }),
			'all'
		)
		expect(result.ok && result.text).toBe('x\nb')
	})

	it('supports multiline anchors', () => {
		const result = applyReplacement(
			'one\ntwo\nthree',
			'^t',
			'T',
			options({ regex: true, multiline: true }),
			'all'
		)
		expect(result.ok && result.text).toBe('one\nTwo\nThree')
	})
})

describe('getLineAndColumn', () => {
	it('reports 1-based line and column', () => {
		expect(getLineAndColumn('ab\ncd', 0)).toEqual({ line: 1, column: 1 })
		expect(getLineAndColumn('ab\ncd', 4)).toEqual({ line: 2, column: 2 })
	})
})

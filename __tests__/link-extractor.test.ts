import { describe, expect, it } from 'vitest'
import { DEFAULT_OPTIONS } from '@/features/miscellaneous/link-extractor/constants'
import type { TExtractorOptions } from '@/features/miscellaneous/link-extractor/types'
import {
	extractUrls,
	hostOf,
	toHref
} from '@/features/miscellaneous/link-extractor/utils/links'
import { runPipeline } from '@/features/miscellaneous/link-extractor/utils/pipeline'

function withOptions(patch: Partial<TExtractorOptions>): TExtractorOptions {
	return { ...DEFAULT_OPTIONS, ...patch }
}

function textOf(input: string, patch: Partial<TExtractorOptions>): string[] {
	return runPipeline(input, withOptions(patch)).lines.map(line => line.text)
}

describe('extractUrls', () => {
	it('finds http, https and bare www urls', () => {
		expect(
			extractUrls('see http://a.dev and https://b.dev plus www.c.dev')
		).toEqual(['http://a.dev', 'https://b.dev', 'www.c.dev'])
	})

	it('drops trailing sentence punctuation', () => {
		expect(extractUrls('go to https://a.dev/path.')).toEqual([
			'https://a.dev/path'
		])
	})

	it('keeps balanced brackets but drops the markdown closer', () => {
		expect(extractUrls('[docs](https://a.dev/x)')).toEqual([
			'https://a.dev/x'
		])
		expect(extractUrls('https://en.wikipedia.org/wiki/Foo_(bar)')).toEqual([
			'https://en.wikipedia.org/wiki/Foo_(bar)'
		])
	})

	it('pulls urls out of html attributes', () => {
		expect(extractUrls('<a href="https://a.dev/x">x</a>')).toEqual([
			'https://a.dev/x'
		])
	})

	it('returns nothing for link-free text', () => {
		expect(extractUrls('no links here')).toEqual([])
	})
})

describe('toHref / hostOf', () => {
	it('adds a scheme to bare hosts only', () => {
		expect(toHref('www.a.dev')).toBe('https://www.a.dev')
		expect(toHref('http://a.dev')).toBe('http://a.dev')
	})

	it('strips the www prefix from the host', () => {
		expect(hostOf('https://www.a.dev/x?y=1')).toBe('a.dev')
	})
})

describe('runPipeline keyword filter', () => {
	const input = 'alpha\nbeta\nAlpha beta'

	it('deletes every line containing the term', () => {
		expect(
			textOf(input, { keyword: 'alpha', keywordMode: 'remove' })
		).toEqual(['beta'])
	})

	it('keeps only the lines containing the term', () => {
		expect(
			textOf(input, { keyword: 'alpha', keywordMode: 'keep' })
		).toEqual(['alpha', 'Alpha beta'])
	})

	it('respects case sensitivity', () => {
		expect(
			textOf(input, {
				keyword: 'Alpha',
				keywordMode: 'keep',
				caseSensitive: true
			})
		).toEqual(['Alpha beta'])
	})

	it('supports regular expressions', () => {
		expect(
			textOf(input, {
				keyword: '^beta$',
				keywordMode: 'keep',
				useRegex: true
			})
		).toEqual(['beta'])
	})

	it('reports an invalid regular expression instead of throwing', () => {
		const result = runPipeline(
			'a',
			withOptions({ keyword: '(', useRegex: true })
		)
		expect(result.error).not.toBeNull()
		expect(result.lines).toEqual([])
	})
})

describe('runPipeline link filters', () => {
	const input = 'intro\nhttps://a.dev\nmid www.b.dev tail\noutro'

	it('deletes every line without a link', () => {
		expect(textOf(input, { linkFilter: 'links-only' })).toEqual([
			'https://a.dev',
			'mid www.b.dev tail'
		])
	})

	it('deletes every line with a link', () => {
		expect(textOf(input, { linkFilter: 'no-links' })).toEqual([
			'intro',
			'outro'
		])
	})

	it('puts each link on its own line', () => {
		expect(
			textOf('https://a.dev and www.b.dev\nnothing', {
				explodeLinks: true
			})
		).toEqual(['https://a.dev', 'www.b.dev'])
	})
})

describe('runPipeline dedupe, blanks and sort', () => {
	it('removes repeated lines and blanks', () => {
		expect(
			textOf('b\n\nb\na\n', { dedupe: true, trimEmpty: true })
		).toEqual(['b', 'a'])
	})

	it('sorts a to z and z to a', () => {
		expect(textOf('c\na\nb', { sort: 'az' })).toEqual(['a', 'b', 'c'])
		expect(textOf('c\na\nb', { sort: 'za' })).toEqual(['c', 'b', 'a'])
	})

	it('sorts by length', () => {
		expect(textOf('ccc\na\nbb', { sort: 'shortest' })).toEqual([
			'a',
			'bb',
			'ccc'
		])
		expect(textOf('ccc\na\nbb', { sort: 'longest' })).toEqual([
			'ccc',
			'bb',
			'a'
		])
	})
})

describe('runPipeline counts', () => {
	it('counts input lines and links in the output', () => {
		const result = runPipeline(
			'a\nhttps://a.dev\nhttps://b.dev',
			withOptions({ linkFilter: 'links-only' })
		)
		expect(result.inputLines).toBe(3)
		expect(result.linkCount).toBe(2)
		expect(result.lines.every(line => line.url !== null)).toBe(true)
	})
})

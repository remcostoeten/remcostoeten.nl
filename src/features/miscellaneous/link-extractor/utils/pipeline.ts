import type {
	TExtractorOptions,
	TExtractorResult,
	TLine,
	TSortMode
} from '../types'
import { extractUrls, findUrl } from './links'

type TMatcher = (line: string) => boolean

function createMatcher(
	options: TExtractorOptions
): { ok: true; matches: TMatcher } | { ok: false; error: string } {
	const { keyword, caseSensitive, useRegex } = options
	if (keyword === '') return { ok: true, matches: () => false }

	if (!useRegex && !caseSensitive) {
		const needle = keyword.toLowerCase()
		return {
			ok: true,
			matches: line => line.toLowerCase().includes(needle)
		}
	}

	if (!useRegex) {
		return { ok: true, matches: line => line.includes(keyword) }
	}

	try {
		const pattern = new RegExp(keyword, caseSensitive ? undefined : 'i')
		return { ok: true, matches: line => pattern.test(line) }
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: 'Invalid regular expression'
		}
	}
}

function sortLines(lines: TLine[], sort: TSortMode): TLine[] {
	if (sort === 'none') return lines
	const sorted = [...lines]
	switch (sort) {
		case 'az':
			sorted.sort((a, b) => a.text.localeCompare(b.text))
			break
		case 'za':
			sorted.sort((a, b) => b.text.localeCompare(a.text))
			break
		case 'shortest':
			sorted.sort(
				(a, b) =>
					a.text.length - b.text.length ||
					a.text.localeCompare(b.text)
			)
			break
		case 'longest':
			sorted.sort(
				(a, b) =>
					b.text.length - a.text.length ||
					a.text.localeCompare(b.text)
			)
			break
	}
	return sorted
}

/**
 * @description Runs the text through the whole extraction pipeline: link filter,
 * keyword filter, link explosion, dedupe, whitespace trim and sort — in that order.
 */
export function runPipeline(
	input: string,
	options: TExtractorOptions
): TExtractorResult {
	const matcher = createMatcher(options)
	const rawLines = input === '' ? [] : input.split(/\r?\n/)

	if (!matcher.ok) {
		return {
			lines: [],
			inputLines: rawLines.length,
			linkCount: 0,
			error: matcher.error
		}
	}

	let texts: string[] = []

	if (options.explodeLinks) {
		for (const line of rawLines) {
			for (const url of extractUrls(line)) texts.push(url)
		}
	} else {
		texts = rawLines
	}

	if (options.linkFilter !== 'all') {
		const wantLink = options.linkFilter === 'links-only'
		texts = texts.filter(text => (findUrl(text) !== null) === wantLink)
	}

	if (options.keyword !== '') {
		const keep = options.keywordMode === 'keep'
		texts = texts.filter(text => matcher.matches(text) === keep)
	}

	if (options.trimEmpty) {
		texts = texts.filter(text => text.trim() !== '')
	}

	if (options.dedupe) {
		const seen = new Set<string>()
		texts = texts.filter(text => {
			if (seen.has(text)) return false
			seen.add(text)
			return true
		})
	}

	let linkCount = 0
	const lines: TLine[] = texts.map((text, index) => {
		const url = findUrl(text)
		if (url !== null) linkCount += 1
		return { key: `${index}:${text}`, text, url }
	})

	return {
		lines: sortLines(lines, options.sort),
		inputLines: rawLines.length,
		linkCount,
		error: null
	}
}

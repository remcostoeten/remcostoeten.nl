import { MATCH_LIMIT } from '../constants'
import type {
	TFindOptions,
	TMatch,
	TReplaceResult,
	TSearchResult
} from '../types'

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

type TBuiltPattern = { ok: true; regex: RegExp } | { ok: false; error: string }

/**
 * Builds the effective search RegExp from the raw query and active options.
 * Non-regex queries are escaped literally; whole-word wraps the source in
 * word boundaries.
 */
export function buildSearchRegex(
	search: string,
	options: TFindOptions
): TBuiltPattern {
	const source = options.regex ? search : escapeRegExp(search)
	const wrapped = options.wholeWord ? `\\b(?:${source})\\b` : source
	const flags = [
		'g',
		options.caseSensitive ? '' : 'i',
		options.regex && options.multiline ? 'm' : ''
	].join('')

	try {
		return { ok: true, regex: new RegExp(wrapped, flags) }
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'Invalid expression'
		}
	}
}

export function findMatches(
	text: string,
	search: string,
	options: TFindOptions
): TSearchResult {
	if (search === '') return { ok: true, matches: [], truncated: false }

	const built = buildSearchRegex(search, options)
	if (!built.ok) return { ok: false, error: built.error }

	const matches: TMatch[] = []
	const { regex } = built
	let truncated = false
	let match = regex.exec(text)

	while (match !== null) {
		matches.push({ start: match.index, end: match.index + match[0].length })
		if (match[0].length === 0) regex.lastIndex += 1
		if (matches.length >= MATCH_LIMIT) {
			truncated = true
			break
		}
		match = regex.exec(text)
	}

	return { ok: true, matches, truncated }
}

function applyCasePattern(source: string, value: string): string {
	if (source === '' || value === '') return value
	const letters = source.replace(/[^a-zA-Z]/g, '')
	if (letters !== '' && letters === letters.toUpperCase()) {
		return value.toUpperCase()
	}
	if (letters !== '' && letters === letters.toLowerCase()) {
		return value.toLowerCase()
	}
	if (/^[A-Z]/.test(source)) {
		return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
	}
	return value
}

function expandReplacementTemplate(
	template: string,
	matched: string,
	groups: (string | undefined)[]
): string {
	return template.replace(/\$(\$|&|\d{1,2})/g, (token, marker: string) => {
		if (marker === '$') return '$'
		if (marker === '&') return matched
		const index = Number(marker)
		if (index >= 1 && index <= groups.length) return groups[index - 1] ?? ''
		return token
	})
}

function trimOutput(text: string): string {
	return text
		.split('\n')
		.map(line => line.replace(/[ \t]+$/, ''))
		.join('\n')
		.replace(/^\n+|\n+$/g, '')
}

export type TReplaceMode =
	| 'all'
	| 'first'
	| 'last'
	| { nth: number }
	| { after: number }
	| { fromLast: number }
	| { allExcept: string }

function countMatches(regex: RegExp, text: string): number {
	const counter = new RegExp(regex.source, regex.flags)
	let total = 0
	let match = counter.exec(text)
	while (match !== null) {
		total += 1
		if (match[0].length === 0) counter.lastIndex += 1
		match = counter.exec(text)
	}
	return total
}

/**
 * Replaces occurrences of the search pattern in `text`. Supports `$1`-style
 * group references in regex mode and case-preserving substitution.
 */
export function applyReplacement(
	text: string,
	search: string,
	replaceValue: string,
	options: TFindOptions,
	mode: TReplaceMode
): TReplaceResult {
	if (search === '') return { ok: true, text, count: 0 }

	const built = buildSearchRegex(search, options)
	if (!built.ok) return { ok: false, error: built.error }

	const needsTotal =
		mode === 'last' || (typeof mode === 'object' && 'fromLast' in mode)
	const total = needsTotal ? countMatches(built.regex, text) : 0

	function shouldReplace(occurrence: number, matched: string): boolean {
		if (mode === 'all') return true
		if (mode === 'first') return occurrence === 0
		if (mode === 'last') return occurrence === total - 1
		if ('nth' in mode) return occurrence === mode.nth
		if ('after' in mode) return occurrence > mode.after
		if ('fromLast' in mode) return occurrence === total - 1 - mode.fromLast
		if (mode.allExcept === '') return true
		return !matched.toLowerCase().includes(mode.allExcept.toLowerCase())
	}

	let count = 0
	let occurrence = -1

	const result = text.replace(built.regex, (...args) => {
		const matched = args[0] as string
		occurrence += 1

		if (!shouldReplace(occurrence, matched)) return matched

		const offsetIndex = args.findIndex(
			(arg, index) => index > 0 && typeof arg === 'number'
		)
		const groups = args.slice(1, offsetIndex) as (string | undefined)[]

		let substitution = options.regex
			? expandReplacementTemplate(replaceValue, matched, groups)
			: replaceValue

		if (options.preserveCase) {
			substitution = applyCasePattern(matched, substitution)
		}

		count += 1
		return substitution
	})

	const finalText = options.trimWhitespace ? trimOutput(result) : result
	return { ok: true, text: finalText, count }
}

export function getLineAndColumn(
	text: string,
	offset: number
): { line: number; column: number } {
	let line = 1
	let lastBreak = -1
	for (let index = 0; index < offset; index += 1) {
		if (text.charCodeAt(index) === 10) {
			line += 1
			lastBreak = index
		}
	}
	return { line, column: offset - lastBreak }
}

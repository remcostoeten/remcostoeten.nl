import type { TDiffLine, TDiffSegment } from '../types'

const LCS_LINE_LIMIT = 3000
const WORD_DIFF_CHAR_LIMIT = 2000

function buildLcsTable(a: string[], b: string[]): Uint32Array {
	const width = b.length + 1
	const table = new Uint32Array((a.length + 1) * width)
	for (let i = a.length - 1; i >= 0; i -= 1) {
		for (let j = b.length - 1; j >= 0; j -= 1) {
			table[i * width + j] =
				a[i] === b[j]
					? table[(i + 1) * width + j + 1] + 1
					: Math.max(
							table[(i + 1) * width + j],
							table[i * width + j + 1]
						)
		}
	}
	return table
}

function diffTokens(
	a: string[],
	b: string[],
	aOffset: number,
	bOffset: number
): TDiffLine[] {
	const table = buildLcsTable(a, b)
	const width = b.length + 1
	const result: TDiffLine[] = []
	let i = 0
	let j = 0

	while (i < a.length && j < b.length) {
		if (a[i] === b[j]) {
			result.push({
				type: 'equal',
				text: a[i],
				aLine: aOffset + i + 1,
				bLine: bOffset + j + 1
			})
			i += 1
			j += 1
		} else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
			result.push({
				type: 'removed',
				text: a[i],
				aLine: aOffset + i + 1,
				bLine: null
			})
			i += 1
		} else {
			result.push({
				type: 'added',
				text: b[j],
				aLine: null,
				bLine: bOffset + j + 1
			})
			j += 1
		}
	}
	while (i < a.length) {
		result.push({
			type: 'removed',
			text: a[i],
			aLine: aOffset + i + 1,
			bLine: null
		})
		i += 1
	}
	while (j < b.length) {
		result.push({
			type: 'added',
			text: b[j],
			aLine: null,
			bLine: bOffset + j + 1
		})
		j += 1
	}
	return result
}

/**
 * Line-level diff. Trims the common prefix/suffix first, then runs an LCS
 * diff on the changed middle. Very large middles (beyond {@link LCS_LINE_LIMIT}
 * lines per side) fall back to a plain removed/added block to stay fast.
 */
export function diffLines(a: string, b: string): TDiffLine[] {
	if (a === b) {
		return a.split('\n').map((text, index) => ({
			type: 'equal',
			text,
			aLine: index + 1,
			bLine: index + 1
		}))
	}

	const aLines = a.split('\n')
	const bLines = b.split('\n')

	let prefix = 0
	const maxPrefix = Math.min(aLines.length, bLines.length)
	while (prefix < maxPrefix && aLines[prefix] === bLines[prefix]) {
		prefix += 1
	}

	let suffix = 0
	while (
		suffix < Math.min(aLines.length, bLines.length) - prefix &&
		aLines[aLines.length - 1 - suffix] ===
			bLines[bLines.length - 1 - suffix]
	) {
		suffix += 1
	}

	const aMiddle = aLines.slice(prefix, aLines.length - suffix)
	const bMiddle = bLines.slice(prefix, bLines.length - suffix)

	const head: TDiffLine[] = aLines.slice(0, prefix).map((text, index) => ({
		type: 'equal',
		text,
		aLine: index + 1,
		bLine: index + 1
	}))

	let middle: TDiffLine[]
	if (aMiddle.length > LCS_LINE_LIMIT || bMiddle.length > LCS_LINE_LIMIT) {
		middle = [
			...aMiddle.map((text, index) => ({
				type: 'removed' as const,
				text,
				aLine: prefix + index + 1,
				bLine: null
			})),
			...bMiddle.map((text, index) => ({
				type: 'added' as const,
				text,
				aLine: null,
				bLine: prefix + index + 1
			}))
		]
	} else {
		middle = diffTokens(aMiddle, bMiddle, prefix, prefix)
	}

	const tail: TDiffLine[] = aLines
		.slice(aLines.length - suffix)
		.map((text, index) => ({
			type: 'equal',
			text,
			aLine: aLines.length - suffix + index + 1,
			bLine: bLines.length - suffix + index + 1
		}))

	return [...head, ...middle, ...tail]
}

/**
 * Word-level diff for a pair of changed lines. Falls back to a whole-line
 * removed/added pair when the lines are too long to compare comfortably.
 */
export function diffWords(a: string, b: string): TDiffSegment[] {
	if (a.length > WORD_DIFF_CHAR_LIMIT || b.length > WORD_DIFF_CHAR_LIMIT) {
		return [
			{ type: 'removed', text: a },
			{ type: 'added', text: b }
		]
	}

	const aTokens = a.split(/(\s+)/).filter(token => token !== '')
	const bTokens = b.split(/(\s+)/).filter(token => token !== '')
	const table = buildLcsTable(aTokens, bTokens)
	const width = bTokens.length + 1
	const segments: TDiffSegment[] = []
	let i = 0
	let j = 0

	function push(type: TDiffSegment['type'], text: string) {
		const last = segments[segments.length - 1]
		if (last && last.type === type) {
			last.text += text
		} else {
			segments.push({ type, text })
		}
	}

	while (i < aTokens.length && j < bTokens.length) {
		if (aTokens[i] === bTokens[j]) {
			push('equal', aTokens[i])
			i += 1
			j += 1
		} else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
			push('removed', aTokens[i])
			i += 1
		} else {
			push('added', bTokens[j])
			j += 1
		}
	}
	while (i < aTokens.length) {
		push('removed', aTokens[i])
		i += 1
	}
	while (j < bTokens.length) {
		push('added', bTokens[j])
		j += 1
	}

	return segments
}

export function summarizeDiff(lines: TDiffLine[]): {
	added: number
	removed: number
} {
	let added = 0
	let removed = 0
	for (const line of lines) {
		if (line.type === 'added') added += 1
		if (line.type === 'removed') removed += 1
	}
	return { added, removed }
}

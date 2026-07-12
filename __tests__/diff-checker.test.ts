import { describe, expect, it } from 'vitest'
import {
	diffChars,
	diffLines,
	diffSegments,
	diffWords,
	summarizeDiff
} from '@/features/miscellaneous/diff-checker/utils/diff'

describe('diffLines', () => {
	it('marks identical texts as fully equal', () => {
		const lines = diffLines('a\nb', 'a\nb')
		expect(lines.every(line => line.type === 'equal')).toBe(true)
	})

	it('detects an added line', () => {
		const lines = diffLines('a\nc', 'a\nb\nc')
		expect(summarizeDiff(lines)).toEqual({ added: 1, removed: 0 })
	})

	it('detects a removed line', () => {
		const lines = diffLines('a\nb\nc', 'a\nc')
		expect(summarizeDiff(lines)).toEqual({ added: 0, removed: 1 })
	})

	it('detects a changed line as a remove plus add', () => {
		const lines = diffLines('a\nb\nc', 'a\nB\nc')
		expect(summarizeDiff(lines)).toEqual({ added: 1, removed: 1 })
	})

	it('tracks original line numbers through changes', () => {
		const lines = diffLines('a\nb\nc', 'a\nc')
		const removed = lines.find(line => line.type === 'removed')
		expect(removed?.aLine).toBe(2)
		expect(removed?.bLine).toBeNull()
	})

	it('handles large inputs without hanging', () => {
		const a = Array.from({ length: 10_000 }, (_, i) => `line ${i}`).join(
			'\n'
		)
		const b = a.replace('line 5000', 'changed')
		const lines = diffLines(a, b)
		expect(summarizeDiff(lines)).toEqual({ added: 1, removed: 1 })
	})
})

describe('diffWords', () => {
	it('isolates the changed word', () => {
		const segments = diffWords('the quick fox', 'the slow fox')
		expect(segments).toEqual([
			{ type: 'equal', text: 'the ' },
			{ type: 'removed', text: 'quick' },
			{ type: 'added', text: 'slow' },
			{ type: 'equal', text: ' fox' }
		])
	})

	it('merges consecutive segments of the same type', () => {
		const segments = diffWords('a b', 'xyzw')
		expect(segments).toEqual([
			{ type: 'removed', text: 'a b' },
			{ type: 'added', text: 'xyzw' }
		])
	})
})

describe('diffChars', () => {
	it('isolates the changed characters inside a word', () => {
		expect(diffChars('color', 'colour')).toEqual([
			{ type: 'equal', text: 'colo' },
			{ type: 'added', text: 'u' },
			{ type: 'equal', text: 'r' }
		])
	})

	it('narrows a change that word mode reports as a whole token', () => {
		expect(diffWords('quick', 'quack')).toEqual([
			{ type: 'removed', text: 'quick' },
			{ type: 'added', text: 'quack' }
		])
		expect(diffChars('quick', 'quack')).toEqual([
			{ type: 'equal', text: 'qu' },
			{ type: 'removed', text: 'i' },
			{ type: 'added', text: 'a' },
			{ type: 'equal', text: 'ck' }
		])
	})

	it('keeps multi-code-unit characters intact', () => {
		expect(diffChars('a🙂b', 'a🙂c')).toEqual([
			{ type: 'equal', text: 'a🙂' },
			{ type: 'removed', text: 'b' },
			{ type: 'added', text: 'c' }
		])
	})
})

describe('diffSegments', () => {
	it('reports line granularity as a whole removed plus added pair', () => {
		expect(diffSegments('the quick fox', 'the slow fox', 'line')).toEqual([
			{ type: 'removed', text: 'the quick fox' },
			{ type: 'added', text: 'the slow fox' }
		])
	})

	it('falls back to whole lines when input exceeds the char-mode limit', () => {
		const a = 'x'.repeat(1300)
		const b = `${'x'.repeat(1299)}y`
		expect(diffSegments(a, b, 'char')).toEqual([
			{ type: 'removed', text: a },
			{ type: 'added', text: b }
		])
	})
})

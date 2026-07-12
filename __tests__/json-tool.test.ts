import { describe, expect, it } from 'vitest'
import {
	toCsv,
	toTypeScript,
	toYaml
} from '@/features/miscellaneous/json-tool/utils/convert'
import {
	measure,
	parseJson,
	sortKeysDeep
} from '@/features/miscellaneous/json-tool/utils/parse'

describe('parseJson', () => {
	it('parses valid JSON', () => {
		const result = parseJson('{"a":1}')
		expect(result).toEqual({ ok: true, value: { a: 1 } })
	})

	it('reports the line and column of a syntax error', () => {
		const result = parseJson('{\n  "a": 1,\n  "b" 2\n}')
		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.line).toBe(3)
		expect(result.column).toBeGreaterThan(0)
	})
})

describe('sortKeysDeep', () => {
	it('sorts nested object keys without touching array order', () => {
		const sorted = sortKeysDeep({ b: 1, a: { d: 2, c: [3, 1, 2] } })
		expect(JSON.stringify(sorted)).toBe('{"a":{"c":[3,1,2],"d":2},"b":1}')
	})
})

describe('measure', () => {
	it('counts nodes, depth and containers', () => {
		const stats = measure({ a: [1, 2], b: { c: 3 } }, 10)
		expect(stats).toEqual({
			bytes: 10,
			nodes: 6,
			depth: 3,
			arrays: 1,
			objects: 2
		})
	})
})

describe('toYaml', () => {
	it('renders nested objects and arrays', () => {
		const result = toYaml({
			name: 'tools',
			items: [{ slug: 'diff' }, { slug: 'json' }],
			active: true
		})
		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.text).toBe(
			[
				'name: tools',
				'items:',
				'  - slug: diff',
				'  - slug: json',
				'active: true'
			].join('\n')
		)
	})

	it('quotes strings that would not survive as plain scalars', () => {
		const result = toYaml({ a: 'yes: no' })
		expect(result.ok && result.text).toBe('a: "yes: no"')
	})
})

describe('toCsv', () => {
	it('unions the keys of every row', () => {
		const result = toCsv([
			{ a: 1, b: 2 },
			{ b: 3, c: 4 }
		])
		expect(result.ok && result.text).toBe('a,b,c\n1,2,\n,3,4')
	})

	it('escapes commas, quotes and newlines', () => {
		const result = toCsv([{ a: 'x,y', b: 'he said "hi"' }])
		expect(result.ok && result.text).toBe('a,b\n"x,y","he said ""hi"""')
	})

	it('refuses a non-array root', () => {
		const result = toCsv({ a: 1 })
		expect(result.ok).toBe(false)
	})
})

describe('toTypeScript', () => {
	it('merges object arrays and marks missing keys optional', () => {
		const result = toTypeScript(
			{ items: [{ a: 1, b: 'x' }, { a: 2 }] },
			'TRoot'
		)
		expect(result.ok && result.text).toBe(
			[
				'type TRoot = {',
				'\titems: {',
				'\t\ta: number',
				'\t\tb?: string',
				'\t}[]',
				'}'
			].join('\n')
		)
	})

	it('unions mixed arrays and handles empty ones', () => {
		const result = toTypeScript({ mixed: [1, 'x'], empty: [] }, 'TRoot')
		expect(result.ok && result.text).toContain('mixed: (number | string)[]')
		expect(result.ok && result.text).toContain('empty: unknown[]')
	})

	it('falls back to a safe name for an invalid identifier', () => {
		const result = toTypeScript(1, 'not a name')
		expect(result.ok && result.text).toBe('type TRoot = number')
	})
})

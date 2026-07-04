import { describe, expect, it } from 'vitest'
import {
	collapseBlankLines,
	dedupeLines,
	removeEmptyLines,
	sortLines,
	trimLines
} from '@/features/miscellaneous/find-replace/utils/text-transforms'

describe('sortLines', () => {
	it('sorts ascending, case-insensitively by default', () => {
		expect(sortLines('banana\nApple\ncherry', 'asc', false)).toBe(
			'Apple\nbanana\ncherry'
		)
	})

	it('sorts descending', () => {
		expect(sortLines('a\nc\nb', 'desc', false)).toBe('c\nb\na')
	})

	it('respects case sensitivity when requested', () => {
		expect(sortLines('b\nA\na', 'asc', true)).toBe('A\na\nb')
	})
})

describe('removeEmptyLines', () => {
	it('drops blank and whitespace-only lines', () => {
		expect(removeEmptyLines('a\n\nb\n   \nc')).toBe('a\nb\nc')
	})
})

describe('trimLines', () => {
	it('trims leading and trailing whitespace per line', () => {
		expect(trimLines('  a  \n b\nc  ')).toBe('a\nb\nc')
	})
})

describe('collapseBlankLines', () => {
	it('collapses runs of 2+ blank lines into one', () => {
		expect(collapseBlankLines('a\n\n\n\nb')).toBe('a\n\nb')
	})

	it('leaves single blank lines untouched', () => {
		expect(collapseBlankLines('a\n\nb')).toBe('a\n\nb')
	})
})

describe('dedupeLines', () => {
	it('keeps only the first occurrence of each line', () => {
		expect(dedupeLines('a\nb\na\nc\nb')).toBe('a\nb\nc')
	})
})

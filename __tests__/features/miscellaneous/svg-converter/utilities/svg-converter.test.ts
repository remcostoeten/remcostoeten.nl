import { JSDOM } from 'jsdom'
import { beforeAll, describe, expect, it } from 'vitest'
import {
	createPackageFiles,
	generateCombined
} from '@/features/miscellaneous/svg-converter/utilities/convert-collection'
import { generateComponent } from '@/features/miscellaneous/svg-converter/utilities/convert-svg'
import { extractSvgs } from '@/features/miscellaneous/svg-converter/utilities/extract-svgs'
import {
	componentName,
	filenameFor,
	registryKey
} from '@/features/miscellaneous/svg-converter/utilities/format-name'
import { normalizeSources } from '@/features/miscellaneous/svg-converter/utilities/normalize-svg'
import { sanitizeSvg } from '@/features/miscellaneous/svg-converter/utilities/sanitize-svg'

beforeAll(() => {
	const window = new JSDOM('').window
	globalThis.DOMParser = window.DOMParser
	globalThis.XMLSerializer = window.XMLSerializer
	globalThis.Node = window.Node
})

describe('SVG extraction', () => {
	it('extracts plain, adjacent, multiline, mixed-case and separated SVGs in order', () => {
		const input = `before <svg><path /></svg><SVG>\n<circle />\n</SVG> words <svg><rect /></svg>`
		const result = extractSvgs(input)
		expect(result.sources).toHaveLength(3)
		expect(
			result.sources.map(source => input.slice(source.start, source.end))
		).toEqual(result.sources.map(source => source.markup))
	})

	it('tracks nested SVG depth and duplicate markup separately', () => {
		const markup = '<svg><svg><path /></svg></svg>'
		const result = extractSvgs(`${markup}${markup}`)
		expect(result.sources).toHaveLength(2)
		expect(result.sources[0].markup).toBe(markup)
		expect(result.sources[1].start).toBe(markup.length)
	})

	it('reports incomplete opening and closing tags without hiding complete entries', () => {
		const result = extractSvgs('</svg><svg><path /></svg><svg><path />')
		expect(result.sources).toHaveLength(2)
		expect(result.sources[0].complete).toBe(true)
		expect(result.sources[1].complete).toBe(false)
		expect(result.errors).toHaveLength(2)
		expect(
			extractSvgs('text <svg viewBox="0 0 2 2"').sources[0]
		).toMatchObject({
			complete: false,
			start: 5
		})
	})

	it('reports no sources when no SVG exists', () => {
		expect(extractSvgs('just text').sources).toEqual([])
	})
})

describe('SVG sanitization', () => {
	it('removes scripts, foreign HTML, handlers, javascript and external references', () => {
		const result = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" onclick="go()"><script>alert(1)</script><foreignObject><div>bad</div></foreignObject><use href="https://bad.test/a.svg#x"/><path fill="javascript:alert(1)" /></svg>'
		)
		expect(result.markup).not.toMatch(
			/script|foreignObject|onclick|https:|javascript:/
		)
		expect(result.errors).toEqual([])
		expect(result.warnings.length).toBeGreaterThanOrEqual(4)
	})

	it('preserves safe gradients, masks and clip paths with internal references', () => {
		const markup =
			'<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="paint"><stop stop-color="#000" /></linearGradient><mask id="mask"><path fill="#fff"/></mask><clipPath id="clip"><rect width="2" height="2"/></clipPath></defs><path fill="url(#paint)" mask="url(#mask)" clip-path="url(#clip)"/></svg>'
		const result = sanitizeSvg(markup)
		expect(result.errors).toEqual([])
		expect(result.markup).toContain('linearGradient')
		expect(result.markup).toContain('url(#paint)')
		expect(result.markup).toContain('url(#mask)')
	})
})

describe('SVG auto-fixes', () => {
	it('keeps fixed-dimension SVGs valid and reports the fix as a notice', () => {
		const item = normalizeSources(
			extractSvgs(
				'<svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 0"/></svg>'
			).sources
		)[0]
		expect(item.state).toBe('valid')
		expect(item.warnings).toEqual([])
		expect(item.notices.join(' ')).toContain('size prop')
	})

	it('derives a viewBox from width and height when missing', () => {
		const item = normalizeSources(
			extractSvgs('<svg width="16" height="32"><path d="M0 0"/></svg>')
				.sources
		)[0]
		expect(item.state).toBe('valid')
		expect(item.viewBox).toBe('0 0 16 32')
		expect(generateComponent(item)).toContain('viewBox="0 0 16 32"')
		expect(item.notices.join(' ')).toContain('added viewBox')
	})

	it('still warns when no viewBox can be derived', () => {
		const item = normalizeSources(
			extractSvgs('<svg><path d="M0 0"/></svg>').sources
		)[0]
		expect(item.state).toBe('warning')
		expect(item.warnings.join(' ')).toContain('no viewBox')
	})

	it('treats auto-resolved duplicate names as valid with a notice', () => {
		const items = normalizeSources(
			extractSvgs(
				'<svg viewBox="0 0 2 2" data-icon="a"/><svg viewBox="0 0 2 2" data-icon="a"/>'
			).sources
		)
		expect(items[1].state).toBe('valid')
		expect(items[1].notices.join(' ')).toContain('duplicate component name')
	})
})

describe('React conversion', () => {
	it('normalizes names and filenames', () => {
		expect(componentName('arrow-left', '')).toBe('ArrowLeftIcon')
		expect(componentName('search icon', '')).toBe('SearchIcon')
		expect(filenameFor('UserProfileIcon')).toBe('user-profile-icon.tsx')
		expect(registryKey('ArrowLeftIcon')).toBe('arrow-left')
	})

	it('generates deterministic accessible TSX, JSX attributes and prefixed IDs', () => {
		const source = extractSvgs(
			'<svg viewBox="0 0 24 24" data-icon="search"><defs><linearGradient id="paint0"><stop offset="1" stop-color="#000" /></linearGradient></defs><path fill="url(#paint0)" fill-rule="evenodd" stroke-width="2" d="M0 0" /></svg>'
		).sources
		const item = normalizeSources(source)[0]
		const first = generateComponent(item)
		expect(generateComponent(item)).toBe(first)
		expect(first).toContain('export function SearchIcon')
		expect(first).toContain('id="search-paint0"')
		expect(first).toContain('fill="url(#search-paint0)"')
		expect(first).toContain('fillRule="evenodd"')
		expect(first).toContain('strokeWidth={2}')
		expect(first).toContain('role={label ? "img" : undefined}')
	})

	it('normalizes mixed-case child tags and safely emits text nodes', () => {
		const item = normalizeSources(
			extractSvgs(
				'<SVG viewBox="0 0 2 2"><TITLE>{unsafe}</TITLE><LINEARGRADIENT id="a" /></SVG>'
			).sources
		)[0]
		const code = generateComponent(item)
		expect(code).toContain('<title>{"{unsafe}"}</title>')
		expect(code).toContain('<linearGradient')
	})

	it('preserves multicolor and references unless conversion is enabled', () => {
		const item = normalizeSources(
			extractSvgs(
				'<svg viewBox="0 0 10 10"><path fill="#000"/><path fill="#f00"/><path fill="none"/><path fill="transparent"/></svg>'
			).sources
		)[0]
		const preserved = generateComponent(item)
		expect(preserved).toContain('fill="#000"')
		expect(preserved).toContain('fill="#f00"')
		item.settings = { ...item.settings, replaceBlack: true }
		const converted = generateComponent(item)
		expect(converted).toContain('fill="currentColor"')
		expect(converted).toContain('fill="#f00"')
		expect(converted).toContain('fill="none"')
	})

	it('resolves duplicate names, excludes invalid entries and makes combined and package output', () => {
		const sources = extractSvgs(
			'<svg data-icon="search"/><svg data-icon="search"/><svg>'
		).sources
		const items = normalizeSources(sources)
		expect(items.map(item => item.component)).toEqual([
			'SearchIcon',
			'SearchIcon2',
			'GeneratedIcon3'
		])
		expect(items[2].state).toBe('invalid')
		const combined = generateCombined(items, true)
		expect(combined).toContain('export function SearchIcon(')
		expect(combined).toContain('export function SearchIcon2(')
		expect(combined).not.toContain('GeneratedIcon3(')
		const files = createPackageFiles(items)
		expect(Object.keys(files).sort()).toEqual([
			'icons/index.ts',
			'icons/search-icon-2.tsx',
			'icons/search-icon.tsx',
			'icons/types.ts'
		])
		expect(files['icons/index.ts'].indexOf('SearchIcon }')).toBeLessThan(
			files['icons/index.ts'].indexOf('SearchIcon2')
		)
	})
})

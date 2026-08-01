import { detectColors } from './detect-colors'
import { sanitizeSvg } from './sanitize-svg'
import type { SvgMetadata } from '../types/svg-converter'

export function parseSvg(markup: string): SvgMetadata {
	const sanitized = sanitizeSvg(markup)
	if (!sanitized.root)
		return {
			markup: '',
			colors: [],
			errors: sanitized.errors,
			warnings: sanitized.warnings
		}
	const root = sanitized.root
	const viewBox = root.getAttribute('viewBox') ?? undefined
	const width = root.getAttribute('width') ?? undefined
	const height = root.getAttribute('height') ?? undefined
	const warnings = [...sanitized.warnings]
	if (!viewBox)
		warnings.push('The SVG has no viewBox and may not scale correctly.')
	if (width || height)
		warnings.push('The SVG uses fixed dimensions that may limit scaling.')
	const sourceName =
		root.getAttribute('data-icon') ??
		root.getAttribute('data-name') ??
		root.getAttribute('id') ??
		Array.from(root.children)
			.find(child => child.tagName.toLowerCase() === 'title')
			?.textContent?.trim() ??
		undefined
	return {
		markup: sanitized.markup,
		viewBox,
		width,
		height,
		sourceName,
		colors: detectColors(root),
		errors: sanitized.errors,
		warnings
	}
}

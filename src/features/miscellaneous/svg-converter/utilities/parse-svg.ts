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
			warnings: sanitized.warnings,
			notices: []
		}
	const root = sanitized.root
	const width = root.getAttribute('width') ?? undefined
	const height = root.getAttribute('height') ?? undefined
	const warnings = [...sanitized.warnings]
	const notices: string[] = []
	let viewBox = root.getAttribute('viewBox') ?? undefined
	let serialized = sanitized.markup
	if (!viewBox && width && height) {
		const numericWidth = Number.parseFloat(width)
		const numericHeight = Number.parseFloat(height)
		if (numericWidth > 0 && numericHeight > 0) {
			viewBox = `0 0 ${numericWidth} ${numericHeight}`
			root.setAttribute('viewBox', viewBox)
			serialized = new XMLSerializer().serializeToString(root)
			notices.push(
				`Auto-fixed: added viewBox "${viewBox}" derived from the fixed dimensions.`
			)
		}
	}
	if (!viewBox)
		warnings.push('The SVG has no viewBox and may not scale correctly.')
	else if (width || height)
		notices.push(
			'Auto-fixed: fixed width/height are replaced with a scalable size prop in the generated component.'
		)
	const sourceName =
		root.getAttribute('data-icon') ??
		root.getAttribute('data-name') ??
		root.getAttribute('id') ??
		Array.from(root.children)
			.find(child => child.tagName.toLowerCase() === 'title')
			?.textContent?.trim() ??
		undefined
	return {
		markup: serialized,
		viewBox,
		width,
		height,
		sourceName,
		colors: detectColors(root),
		errors: sanitized.errors,
		warnings,
		notices
	}
}

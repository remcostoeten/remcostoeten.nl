const ALLOWED_ELEMENTS = new Set([
	'svg',
	'g',
	'path',
	'circle',
	'rect',
	'line',
	'polyline',
	'polygon',
	'ellipse',
	'defs',
	'clippath',
	'mask',
	'lineargradient',
	'radialgradient',
	'stop',
	'pattern',
	'symbol',
	'use',
	'title',
	'desc',
	'filter',
	'fegaussianblur',
	'feoffset',
	'feblend',
	'fecolormatrix',
	'femerge',
	'femergenode',
	'feflood',
	'fecomposite',
	'tspan',
	'text',
	'marker'
])
const BLOCKED_ELEMENTS = new Set([
	'script',
	'foreignobject',
	'iframe',
	'object',
	'embed',
	'image',
	'style'
])
const URL_ATTRIBUTES = new Set(['href', 'xlink:href', 'src'])

export type SanitizeResult = {
	markup: string
	errors: string[]
	warnings: string[]
	root?: Element
}

function isUnsafeValue(value: string): boolean {
	const normalized = Array.from(value.trim().toLowerCase())
		.filter(character => character.charCodeAt(0) > 32)
		.join('')
	return (
		normalized.startsWith('javascript:') ||
		normalized.startsWith('data:text/html')
	)
}

function isExternalReference(value: string): boolean {
	const normalized = value.trim().toLowerCase()
	return /^(?:https?:|\/\/|data:|blob:|file:)/.test(normalized)
}

export function sanitizeSvg(markup: string): SanitizeResult {
	const parser = new DOMParser()
	const document = parser.parseFromString(markup, 'image/svg+xml')
	const parserError = document.querySelector('parsererror')
	if (parserError)
		return {
			markup: '',
			errors: [
				`The SVG could not be parsed: ${parserError.textContent?.trim().slice(0, 180) ?? 'Malformed XML.'}`
			],
			warnings: []
		}
	const root = document.documentElement
	if (root.tagName.toLowerCase() !== 'svg')
		return {
			markup: '',
			errors: ['The input does not contain an SVG root element.'],
			warnings: []
		}

	const errors: string[] = []
	const warnings: string[] = []
	for (const node of Array.from(root.querySelectorAll('*')).reverse()) {
		const tag = node.tagName.toLowerCase()
		if (BLOCKED_ELEMENTS.has(tag)) {
			if (tag === 'script')
				errors.push('The SVG contains unsupported script content.')
			else if (tag === 'foreignobject')
				errors.push(
					'The SVG contains unsupported embedded HTML content.'
				)
			else warnings.push(`Removed unsafe <${node.tagName}> content.`)
			node.remove()
			continue
		}
		if (!ALLOWED_ELEMENTS.has(tag)) {
			warnings.push(`Removed unsupported <${node.tagName}> element.`)
			node.remove()
			continue
		}
	}

	for (const node of [root, ...Array.from(root.querySelectorAll('*'))]) {
		for (const attribute of Array.from(node.attributes)) {
			const name = attribute.name.toLowerCase()
			const value = attribute.value
			if (name.startsWith('on')) {
				node.removeAttribute(attribute.name)
				errors.push(`Removed unsafe ${attribute.name} event handler.`)
			} else if (isUnsafeValue(value)) {
				node.removeAttribute(attribute.name)
				errors.push('Removed a JavaScript URL from the SVG.')
			} else if (URL_ATTRIBUTES.has(name) && isExternalReference(value)) {
				node.removeAttribute(attribute.name)
				errors.push('The SVG contains an unsafe external reference.')
			} else if (
				name === 'style' &&
				/(?:url\s*\(\s*["']?(?!#)|@import|expression\s*\()/i.test(value)
			) {
				node.removeAttribute(attribute.name)
				errors.push('Removed unsafe style content.')
			} else if (/url\s*\(\s*["']?(?!#)/i.test(value)) {
				node.removeAttribute(attribute.name)
				errors.push('The SVG contains an unsafe external reference.')
			}
		}
	}

	const serializer = new XMLSerializer()
	return {
		markup: serializer.serializeToString(root),
		errors,
		warnings,
		root
	}
}

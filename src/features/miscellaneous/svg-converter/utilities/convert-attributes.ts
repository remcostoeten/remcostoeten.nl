const JSX_NAMES: Record<string, string> = {
	class: 'className',
	'fill-rule': 'fillRule',
	'clip-rule': 'clipRule',
	'stroke-width': 'strokeWidth',
	'stroke-linecap': 'strokeLinecap',
	'stroke-linejoin': 'strokeLinejoin',
	'stroke-miterlimit': 'strokeMiterlimit',
	'stroke-dasharray': 'strokeDasharray',
	'stroke-dashoffset': 'strokeDashoffset',
	'stroke-opacity': 'strokeOpacity',
	'fill-opacity': 'fillOpacity',
	'stop-color': 'stopColor',
	'stop-opacity': 'stopOpacity',
	'color-interpolation': 'colorInterpolation',
	'color-interpolation-filters': 'colorInterpolationFilters',
	'flood-color': 'floodColor',
	'flood-opacity': 'floodOpacity',
	'xmlns:xlink': 'xmlnsXlink',
	'xlink:href': 'xlinkHref',
	tabindex: 'tabIndex',
	'clip-path': 'clipPath',
	'mask-type': 'maskType',
	preserveaspectratio: 'preserveAspectRatio',
	viewbox: 'viewBox',
	gradientunits: 'gradientUnits',
	gradienttransform: 'gradientTransform',
	spreadmethod: 'spreadMethod',
	patternunits: 'patternUnits',
	patterncontentunits: 'patternContentUnits',
	patterntransform: 'patternTransform',
	markerwidth: 'markerWidth',
	markerheight: 'markerHeight',
	markerunits: 'markerUnits',
	refx: 'refX',
	refy: 'refY',
	clippathunits: 'clipPathUnits',
	maskunits: 'maskUnits',
	maskcontentunits: 'maskContentUnits',
	filterunits: 'filterUnits',
	primitiveunits: 'primitiveUnits',
	stddeviation: 'stdDeviation',
	pathlength: 'pathLength',
	textlength: 'textLength',
	lengthadjust: 'lengthAdjust',
	attributename: 'attributeName',
	attributetype: 'attributeType',
	keytimes: 'keyTimes',
	keysplines: 'keySplines',
	repeatcount: 'repeatCount',
	repeatdur: 'repeatDur',
	systemlanguage: 'systemLanguage'
}
const NUMERIC = new Set([
	'cx',
	'cy',
	'r',
	'rx',
	'ry',
	'x',
	'x1',
	'x2',
	'y',
	'y1',
	'y2',
	'offset',
	'opacity',
	'pathLength',
	'strokeWidth',
	'strokeMiterlimit',
	'strokeDashoffset',
	'strokeOpacity',
	'fillOpacity',
	'stopOpacity',
	'floodOpacity'
])

function jsxName(name: string): string {
	const lower = name.toLowerCase()
	if (JSX_NAMES[lower]) return JSX_NAMES[lower]
	if (lower.startsWith('aria-') || lower.startsWith('data-')) return lower
	return lower.replace(/-([a-z])/g, (_, letter: string) =>
		letter.toUpperCase()
	)
}

function stringLiteral(value: string): string {
	return JSON.stringify(value).replace(/</g, '\\u003c')
}

function styleObject(value: string): string {
	const entries = value
		.split(';')
		.map(part => part.trim())
		.filter(Boolean)
		.flatMap(part => {
			const separator = part.indexOf(':')
			if (separator < 1) return []
			const property = part
				.slice(0, separator)
				.trim()
				.replace(/-([a-z])/g, (_, letter: string) =>
					letter.toUpperCase()
				)
			const content = part.slice(separator + 1).trim()
			return [`${JSON.stringify(property)}: ${stringLiteral(content)}`]
		})
	return `{{ ${entries.join(', ')} }}`
}

export function convertAttribute(name: string, value: string): string {
	const converted = jsxName(name)
	if (converted === 'style') return `style=${styleObject(value)}`
	if (NUMERIC.has(converted) && /^-?(?:\d+\.?\d*|\.\d+)$/.test(value))
		return `${converted}={${Number(value)}}`
	return `${converted}=${stringLiteral(value)}`
}

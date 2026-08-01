import type { SvgColor } from '../types/svg-converter'

const COLOR_ATTRIBUTES = new Set([
	'fill',
	'stroke',
	'stop-color',
	'flood-color',
	'color'
])

export function normalizeColor(value: string): string {
	const compact = value.trim().toLowerCase().replace(/\s+/g, '')
	if (compact === 'black' || compact === '#000' || compact === '#000000')
		return '#000000'
	if (compact === 'white' || compact === '#fff' || compact === '#ffffff')
		return '#ffffff'
	if (
		/^rgb\(0,0,0\)$/.test(compact) ||
		/^rgba\(0,0,0,1(?:\.0+)?\)$/.test(compact)
	)
		return '#000000'
	return compact
}

export function isBlackLike(value: string): boolean {
	return normalizeColor(value) === '#000000'
}

function record(map: Map<string, SvgColor>, value: string, location: string) {
	const normalized = normalizeColor(value)
	if (
		!normalized ||
		['none', 'transparent', 'currentcolor'].includes(normalized) ||
		normalized.startsWith('url(')
	)
		return
	const existing = map.get(normalized)
	if (existing) {
		existing.count += 1
		existing.locations.push(location)
	} else
		map.set(normalized, {
			value,
			normalized,
			count: 1,
			locations: [location]
		})
}

export function detectColors(root: Element): SvgColor[] {
	const colors = new Map<string, SvgColor>()
	for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
		for (const attribute of Array.from(element.attributes)) {
			if (COLOR_ATTRIBUTES.has(attribute.name.toLowerCase()))
				record(
					colors,
					attribute.value,
					`${element.tagName}.${attribute.name}`
				)
			if (attribute.name.toLowerCase() === 'style') {
				for (const declaration of attribute.value.split(';')) {
					const [property, ...rest] = declaration.split(':')
					if (COLOR_ATTRIBUTES.has(property?.trim().toLowerCase()))
						record(
							colors,
							rest.join(':'),
							`${element.tagName}.style.${property.trim()}`
						)
				}
			}
		}
	}
	return Array.from(colors.values())
}

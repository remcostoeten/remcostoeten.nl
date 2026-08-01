import { registryKey } from './format-name'

const URL_REFERENCE = /url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g

export function rewriteIds(root: Element, component: string): void {
	const prefix = registryKey(component)
	const ids = new Map<string, string>()
	for (const element of [
		root,
		...Array.from(root.querySelectorAll('[id]'))
	]) {
		const id = element.getAttribute('id')
		if (!id) continue
		const replacement = `${prefix}-${id}`
		ids.set(id, replacement)
		element.setAttribute('id', replacement)
	}
	if (ids.size === 0) return
	for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
		for (const attribute of Array.from(element.attributes)) {
			let value = attribute.value.replace(
				URL_REFERENCE,
				(match, quote: string, id: string) => {
					const replacement = ids.get(id)
					return replacement ? `url(#${replacement})` : match
				}
			)
			if (
				(attribute.name === 'href' ||
					attribute.name === 'xlink:href') &&
				value.startsWith('#')
			)
				value = `#${ids.get(value.slice(1)) ?? value.slice(1)}`
			if (attribute.name === 'begin' || attribute.name === 'end') {
				value = value
					.split(';')
					.map(part => {
						const match = part.match(/^\s*([^.\s]+)(\..+)$/)
						return match && ids.has(match[1])
							? part.replace(match[1], ids.get(match[1])!)
							: part
					})
					.join(';')
			}
			if (value !== attribute.value)
				element.setAttribute(attribute.name, value)
		}
	}
}

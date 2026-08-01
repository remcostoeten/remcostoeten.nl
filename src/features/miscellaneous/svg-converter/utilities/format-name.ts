const WORDS = /[a-zA-Z0-9]+/g

export function toPascalCase(value: string): string {
	const words = value.match(WORDS) ?? []
	return words
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('')
}

export function toKebabCase(value: string): string {
	return (
		value
			.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
			.replace(/([a-zA-Z])(\d+)/g, '$1-$2')
			.match(WORDS)
			?.map(word => word.toLowerCase())
			.join('-') ?? ''
	)
}

export function componentName(value: string, fallback: string): string {
	const normalized = toPascalCase(value) || fallback
	return /icon$/i.test(normalized)
		? normalized.replace(/icon$/i, 'Icon')
		: `${normalized}Icon`
}

export function filenameFor(component: string): string {
	return `${toKebabCase(component)}.tsx`
}

export function registryKey(component: string): string {
	return toKebabCase(component.replace(/Icon$/i, '')) || 'icon'
}

export function uniqueName(base: string, used: Set<string>): string {
	let candidate = base
	let suffix = 2
	while (used.has(candidate)) candidate = `${base}${suffix++}`
	used.add(candidate)
	return candidate
}

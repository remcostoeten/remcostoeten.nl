export type TSortOrder = 'asc' | 'desc'

export function sortLines(
	text: string,
	order: TSortOrder,
	caseSensitive: boolean
): string {
	const lines = text.split('\n')
	const compare = (a: string, b: string) =>
		caseSensitive
			? a < b
				? -1
				: a > b
					? 1
					: 0
			: a.toLowerCase().localeCompare(b.toLowerCase())
	const sorted = [...lines].sort(
		order === 'asc' ? compare : (a, b) => compare(b, a)
	)
	return sorted.join('\n')
}

export function removeEmptyLines(text: string): string {
	return text
		.split('\n')
		.filter(line => line.trim() !== '')
		.join('\n')
}

export function trimLines(text: string): string {
	return text
		.split('\n')
		.map(line => line.trim())
		.join('\n')
}

export function collapseBlankLines(text: string): string {
	return text.replace(/\n{3,}/g, '\n\n')
}

export function dedupeLines(text: string): string {
	const seen = new Set<string>()
	const result: string[] = []
	for (const line of text.split('\n')) {
		if (seen.has(line)) continue
		seen.add(line)
		result.push(line)
	}
	return result.join('\n')
}

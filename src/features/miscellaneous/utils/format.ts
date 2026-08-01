/**
 * Formats a byte count as a compact human-readable size, e.g. `3.2 MB`.
 */
export function bytesToHuman(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB']
	let size = bytes
	let index = 0
	while (size >= 1024 && index < units.length - 1) {
		size /= 1024
		index += 1
	}
	return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

/**
 * Formats a duration in seconds with two decimals, e.g. `12.50s`.
 */
export function formatSeconds(seconds: number): string {
	if (!Number.isFinite(seconds)) return '0.00s'
	return `${seconds.toFixed(2)}s`
}

/**
 * Formats a time range as `start - end` using {@link formatSeconds}.
 */
export function formatRange(start: number, end: number): string {
	return `${formatSeconds(start)} - ${formatSeconds(end)}`
}

/**
 * Returns a filename without its extension.
 */
export function stem(filename: string): string {
	const index = filename.lastIndexOf('.')
	return index === -1 ? filename : filename.slice(0, index)
}

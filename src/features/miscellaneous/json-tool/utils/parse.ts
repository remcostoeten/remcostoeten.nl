import type { TJsonStats, TJsonValue, TParseResult } from '../types'

function locate(
	text: string,
	message: string
): { line: number | null; column: number | null } {
	const explicit = /line (\d+) column (\d+)/i.exec(message)
	if (explicit !== null) {
		return { line: Number(explicit[1]), column: Number(explicit[2]) }
	}

	const positioned = /position (\d+)/i.exec(message)
	if (positioned === null) return { line: null, column: null }

	const position = Math.min(Number(positioned[1]), text.length)
	const upTo = text.slice(0, position)
	const lines = upTo.split(/\r?\n/)
	return { line: lines.length, column: lines[lines.length - 1].length + 1 }
}

export function parseJson(text: string): TParseResult {
	try {
		return { ok: true, value: JSON.parse(text) as TJsonValue }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Could not parse this JSON'
		return { ok: false, error: message, ...locate(text, message) }
	}
}

export function sortKeysDeep(value: TJsonValue): TJsonValue {
	if (Array.isArray(value)) return value.map(sortKeysDeep)
	if (value === null || typeof value !== 'object') return value

	const sorted: Record<string, TJsonValue> = {}
	for (const key of Object.keys(value).sort()) {
		sorted[key] = sortKeysDeep(value[key])
	}
	return sorted
}

export function measure(value: TJsonValue, bytes: number): TJsonStats {
	const stats: TJsonStats = {
		bytes,
		nodes: 0,
		depth: 0,
		arrays: 0,
		objects: 0
	}

	function walk(node: TJsonValue, depth: number) {
		stats.nodes += 1
		if (depth > stats.depth) stats.depth = depth

		if (Array.isArray(node)) {
			stats.arrays += 1
			for (const item of node) walk(item, depth + 1)
			return
		}
		if (node !== null && typeof node === 'object') {
			stats.objects += 1
			for (const key of Object.keys(node)) walk(node[key], depth + 1)
		}
	}

	walk(value, 1)
	return stats
}

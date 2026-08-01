import { componentName, filenameFor, uniqueName } from './format-name'
import { parseSvg } from './parse-svg'
import type { SvgItem, SvgSource } from '../types/svg-converter'
import { DEFAULT_SETTINGS } from '../types/svg-converter'

function stableHash(value: string): string {
	let hash = 2166136261
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index)
		hash = Math.imul(hash, 16777619)
	}
	return (hash >>> 0).toString(36)
}

export function normalizeSources(
	sources: SvgSource[],
	filenames: (string | undefined)[] = []
): SvgItem[] {
	const used = new Set<string>()
	const single = sources.length === 1
	return sources.map((source, index) => {
		const importedFilename = filenames[index]
		const parsed = source.complete
			? parseSvg(source.markup)
			: { markup: '', colors: [], errors: source.errors, warnings: [] }
		const rawName =
			parsed.sourceName || importedFilename?.replace(/\.svg$/i, '') || ''
		const fallback = single
			? 'GeneratedSvgIcon'
			: `GeneratedIcon${index + 1}`
		const base = rawName ? componentName(rawName, fallback) : fallback
		const component = uniqueName(base, used)
		const duplicate = component !== base
		const errors = [...source.errors, ...parsed.errors]
		const warnings = [...parsed.warnings]
		if (duplicate)
			warnings.push(
				'A duplicate component name was resolved automatically.'
			)
		return {
			id: `svg-${source.start}-${stableHash(source.markup)}-${index}`,
			index: index + 1,
			source,
			importedFilename,
			name:
				rawName ||
				(single ? 'Generated SVG' : `Generated icon ${index + 1}`),
			component,
			filename: filenameFor(component),
			state: errors.length
				? 'invalid'
				: warnings.length
					? 'warning'
					: 'valid',
			errors,
			warnings,
			colors: parsed.colors,
			markup: parsed.markup,
			viewBox: parsed.viewBox,
			width: parsed.width,
			height: parsed.height,
			settings: {
				...DEFAULT_SETTINGS,
				primaryColor: parsed.colors[0]?.value
			}
		}
	})
}

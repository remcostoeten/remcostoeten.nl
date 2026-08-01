import type { SvgSource } from '../types/svg-converter'

export type ExtractionResult = {
	sources: SvgSource[]
	errors: string[]
}

const TAG = /<\/?svg\b[^>]*>/gi

export function extractSvgs(input: string): ExtractionResult {
	const sources: SvgSource[] = []
	const errors: string[] = []
	const recognizedTags = new Set<number>()
	let depth = 0
	let start = -1
	let match: RegExpExecArray | null

	TAG.lastIndex = 0
	while ((match = TAG.exec(input))) {
		recognizedTags.add(match.index)
		const token = match[0]
		const closing = /^<\//.test(token)
		const selfClosing = /\/\s*>$/.test(token)

		if (closing) {
			if (depth === 0) {
				errors.push(
					`Incomplete SVG closing tag at character ${match.index}.`
				)
				continue
			}
			depth -= 1
			if (depth === 0 && start >= 0) {
				const end = match.index + token.length
				sources.push({
					start,
					end,
					markup: input.slice(start, end),
					complete: true,
					errors: []
				})
				start = -1
			}
			continue
		}

		if (depth === 0) start = match.index
		if (!selfClosing) depth += 1
		else if (depth === 0) {
			const end = match.index + token.length
			sources.push({
				start: match.index,
				end,
				markup: token,
				complete: true,
				errors: []
			})
			start = -1
		}
	}

	if (depth > 0 && start >= 0) {
		const message = `Incomplete SVG opening tag at character ${start}.`
		sources.push({
			start,
			end: input.length,
			markup: input.slice(start),
			complete: false,
			errors: [message]
		})
		errors.push(message)
	}

	const candidates = /<\/?svg\b/gi
	while ((match = candidates.exec(input))) {
		if (recognizedTags.has(match.index)) continue
		const closing = input.startsWith('</', match.index)
		const message = `Incomplete SVG ${closing ? 'closing' : 'opening'} tag at character ${match.index}.`
		if (!errors.includes(message)) errors.push(message)
		if (
			!closing &&
			!sources.some(
				source =>
					source.start <= match!.index && source.end > match!.index
			)
		) {
			sources.push({
				start: match.index,
				end: input.length,
				markup: input.slice(match.index),
				complete: false,
				errors: [message]
			})
		}
	}
	sources.sort((a, b) => a.start - b.start)

	return { sources, errors }
}

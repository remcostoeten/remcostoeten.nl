import type { TTrimRange } from '../../types/media'
import { INPUT_NAME } from '../constants'
import type { TPersistedOptions } from '../types'

const QUALITY_FILTERS = {
	small: {
		palettegen: 'palettegen=max_colors=128',
		paletteuse: 'paletteuse=dither=bayer:bayer_scale=3'
	},
	balanced: {
		palettegen: 'palettegen=stats_mode=diff',
		paletteuse: 'paletteuse=dither=sierra2_4a'
	},
	high: {
		palettegen: 'palettegen=stats_mode=diff:max_colors=256',
		paletteuse: 'paletteuse=dither=sierra2_4a:diff_mode=rectangle'
	}
} as const

function gifFilter(options: TPersistedOptions): string {
	const quality = QUALITY_FILTERS[options.quality]
	const scale =
		options.width === 'original'
			? ''
			: `,scale='min(${options.width},iw)':-1:flags=lanczos`
	return `fps=${options.fps}${scale},split[s0][s1];[s0]${quality.palettegen}[p];[s1][p]${quality.paletteuse}`
}

function seekArgs(range: TTrimRange | null): {
	before: string[]
	after: string[]
} {
	if (!range) return { before: [], after: [] }
	return {
		before: range.start > 0.01 ? ['-ss', range.start.toFixed(3)] : [],
		after: ['-to', (range.end - range.start).toFixed(3)]
	}
}

/**
 * Trimmed clip → palette-optimized looping GIF at the chosen
 * fps/width/quality.
 */
export function convertArgs(
	options: TPersistedOptions,
	range: TTrimRange | null,
	outputName: string
): string[] {
	const seek = seekArgs(range)
	return [
		...seek.before,
		'-i',
		INPUT_NAME,
		...seek.after,
		'-filter_complex',
		gifFilter(options),
		'-loop',
		'0',
		outputName
	]
}

/**
 * Same encode limited to the first few seconds of the selection — a fast
 * sample to judge settings and extrapolate the full file size from.
 */
export function previewArgs(
	options: TPersistedOptions,
	range: TTrimRange | null,
	seconds: number,
	outputName: string
): string[] {
	const start = range && range.start > 0.01 ? range.start : null
	return [
		...(start !== null ? ['-ss', start.toFixed(3)] : []),
		'-i',
		INPUT_NAME,
		'-t',
		seconds.toFixed(2),
		'-filter_complex',
		gifFilter(options),
		'-loop',
		'0',
		outputName
	]
}

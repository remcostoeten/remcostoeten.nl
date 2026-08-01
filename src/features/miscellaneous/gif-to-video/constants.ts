import type { TPersistedOptions, TVideoFormat, TVideoQuality } from './types'

export const STORAGE_KEY = 'tools:gif-to-video:v1'

export const MAX_INPUT_MB = 300

export const ACCEPTED_INPUT = 'image/gif,.gif'

export const INPUT_NAME = 'g2v_input.gif'

export const OUTPUT_NAMES: Record<TVideoFormat, string> = {
	mp4: 'g2v_output.mp4',
	webm: 'g2v_output.webm'
}

export const OUTPUT_MIMES: Record<TVideoFormat, string> = {
	mp4: 'video/mp4',
	webm: 'video/webm'
}

export const FORMAT_OPTIONS = [
	{ value: 'mp4', label: 'MP4', hint: 'H.264 — plays everywhere' },
	{ value: 'webm', label: 'WebM', hint: 'VP9 — smaller, browsers only' }
] as const satisfies readonly {
	value: TVideoFormat
	label: string
	hint: string
}[]

export const QUALITY_OPTIONS = [
	{ value: 'small', label: 'Small', hint: 'Most compression, softer image' },
	{ value: 'balanced', label: 'Balanced', hint: 'Good size/quality tradeoff' },
	{ value: 'high', label: 'High', hint: 'Near-lossless, largest file' }
] as const satisfies readonly {
	value: TVideoQuality
	label: string
	hint: string
}[]

export const DEFAULT_OPTIONS: TPersistedOptions = {
	version: 1,
	format: 'mp4',
	quality: 'balanced'
}

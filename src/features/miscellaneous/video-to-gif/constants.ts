import type {
	TGifFps,
	TGifQuality,
	TGifWidth,
	TPersistedOptions
} from './types'

export const STORAGE_KEY = 'tools:video-to-gif:v1'

export const MAX_INPUT_MB = 900

export const ACCEPTED_INPUT = 'video/*,.mkv,.mov,.m4v,.webm,.avi'

export const INPUT_NAME = 'v2g_input'

export const OUTPUT_NAME = 'v2g_output.gif'

export const PREVIEW_NAME = 'v2g_preview.gif'

export const PREVIEW_SECONDS = 2.5

export const FPS_OPTIONS = [
	{ value: '10', label: '10 fps', hint: 'Smallest file, choppier motion' },
	{ value: '15', label: '15 fps', hint: 'Good balance for most clips' },
	{ value: '20', label: '20 fps', hint: 'Smooth motion, larger file' },
	{ value: '24', label: '24 fps', hint: 'Near-source smoothness, largest file' }
] as const satisfies readonly { value: TGifFps; label: string; hint: string }[]

export const WIDTH_OPTIONS = [
	{ value: '320', label: '320px', hint: 'Tiny, chat-thumbnail size' },
	{ value: '480', label: '480px', hint: 'Standard GIF size' },
	{ value: '640', label: '640px', hint: 'Large, readable detail' },
	{ value: 'original', label: 'Original', hint: 'Keep the source resolution' }
] as const satisfies readonly {
	value: TGifWidth
	label: string
	hint: string
}[]

export const QUALITY_OPTIONS = [
	{ value: 'small', label: 'Small', hint: '128 colors, fast dither' },
	{ value: 'balanced', label: 'Balanced', hint: '256 colors, smooth dither' },
	{ value: 'high', label: 'High', hint: 'Motion-optimized palette' }
] as const satisfies readonly {
	value: TGifQuality
	label: string
	hint: string
}[]

export const DEFAULT_OPTIONS: TPersistedOptions = {
	version: 1,
	fps: '15',
	width: '480',
	quality: 'balanced'
}

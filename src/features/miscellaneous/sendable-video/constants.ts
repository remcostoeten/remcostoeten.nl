import type { TGifFps, TGifPreset, TPersistedOptions } from './types'

export const STORAGE_KEY = 'tools:sendable-video:v1'

export const MAX_INPUT_MB = 900

export const ACCEPTED_INPUT = 'video/*,.mkv,.mov,.m4v,.webm,.avi'

export const FFMPEG_CORE_BASE_URL =
	'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

export const INPUT_NAME = 'input_video'

export const OUTPUT_MP4 = 'sendable_output.mp4'

export const OUTPUT_GIF = 'sendable_output.gif'

export const GIF_PRESETS: Record<TGifFps, TGifPreset> = {
	'10': { fps: 10, maxWidth: 480 },
	'12': { fps: 12, maxWidth: 720 },
	'16': { fps: 16, maxWidth: 960 }
}

export const GIF_FPS_OPTIONS = [
	{ value: '10', label: '10 fps', hint: 'Smallest file, max 480px wide' },
	{ value: '12', label: '12 fps', hint: 'Balanced, max 720px wide' },
	{ value: '16', label: '16 fps', hint: 'Smoothest, max 960px wide' }
] as const satisfies readonly { value: TGifFps; label: string; hint: string }[]

export const DEFAULT_OPTIONS: TPersistedOptions = {
	version: 1,
	muteAudio: false,
	gifFps: '12'
}

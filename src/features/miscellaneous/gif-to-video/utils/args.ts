import { INPUT_NAME, OUTPUT_NAMES } from '../constants'
import type { TPersistedOptions, TVideoQuality } from '../types'

const X264_CRF: Record<TVideoQuality, string> = {
	small: '30',
	balanced: '26',
	high: '22'
}

const VP9_CRF: Record<TVideoQuality, string> = {
	small: '40',
	balanced: '34',
	high: '28'
}

/**
 * GIF → video encode. H.264 needs even dimensions, hence the trunc scale;
 * VP9 runs in realtime deadline because wasm VP9 is slow otherwise.
 */
export function convertArgs(options: TPersistedOptions): string[] {
	if (options.format === 'mp4') {
		return [
			'-i',
			INPUT_NAME,
			'-vf',
			'scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos',
			'-c:v',
			'libx264',
			'-preset',
			'veryfast',
			'-crf',
			X264_CRF[options.quality],
			'-pix_fmt',
			'yuv420p',
			'-movflags',
			'+faststart',
			'-an',
			OUTPUT_NAMES.mp4
		]
	}

	return [
		'-i',
		INPUT_NAME,
		'-c:v',
		'libvpx-vp9',
		'-crf',
		VP9_CRF[options.quality],
		'-b:v',
		'0',
		'-deadline',
		'realtime',
		'-cpu-used',
		'5',
		'-pix_fmt',
		'yuv420p',
		'-an',
		OUTPUT_NAMES.webm
	]
}

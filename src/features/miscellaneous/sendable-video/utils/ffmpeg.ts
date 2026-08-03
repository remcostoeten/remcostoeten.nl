import { INPUT_NAME, OUTPUT_GIF, OUTPUT_MP4 } from '../constants'
import type { TTrimRange } from '../../types/media'
import type { TGifPreset } from '../types'

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
 * Decides from `ffmpeg -i` probe output whether a lossless remux would yield
 * a chat-app compatible MP4: H.264 video plus AAC/MP3 or no audio. HEVC
 * sources (typical iPhone .MOV) remux without error but produce an MP4 that
 * browsers and WhatsApp Web cannot decode, so they must take the re-encode
 * path instead.
 */
export function isRemuxCompatible(probe: string): boolean {
	if (!/Video:\s*h264/i.test(probe)) return false
	const codecs = [...probe.matchAll(/Audio:\s*(\w+)/gi)].map(match => match[1])
	return codecs.every(codec => /^(aac|mp3)$/i.test(codec))
}

/**
 * Lossless remux into MP4 with a faststart header — the quick path when the
 * source codecs are already chat-app compatible.
 */
export function remuxArgs(range: TTrimRange | null): string[] {
	const seek = seekArgs(range)
	return [
		...seek.before,
		'-i',
		INPUT_NAME,
		...seek.after,
		'-map',
		'0:v:0?',
		'-map',
		'0:a:0?',
		'-c',
		'copy',
		'-movflags',
		'+faststart',
		OUTPUT_MP4
	]
}

/**
 * Compatibility re-encode: H.264 baseline yuv420p capped at 1280px/30fps with
 * AAC audio — the profile WhatsApp Web reliably accepts.
 */
export function encodeArgs(
	range: TTrimRange | null,
	muteAudio: boolean
): string[] {
	const seek = seekArgs(range)
	return [
		...seek.before,
		'-i',
		INPUT_NAME,
		...seek.after,
		'-c:v',
		'libx264',
		'-preset',
		'veryfast',
		'-crf',
		'26',
		'-profile:v',
		'baseline',
		'-level',
		'3.1',
		'-pix_fmt',
		'yuv420p',
		'-vf',
		'scale=min(1280\\,iw):-2:flags=bilinear',
		'-r',
		'30',
		'-movflags',
		'+faststart',
		...(muteAudio
			? ['-an']
			: ['-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-ar', '44100']),
		OUTPUT_MP4
	]
}

/**
 * Two-pass palette GIF encode (palettegen + paletteuse) at the preset's fps
 * and max width.
 */
export function gifArgs(range: TTrimRange | null, preset: TGifPreset): string[] {
	const seek = seekArgs(range)
	return [
		...seek.before,
		'-i',
		INPUT_NAME,
		...seek.after,
		'-filter_complex',
		`fps=${preset.fps},scale='min(${preset.maxWidth},iw)':-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a`,
		'-loop',
		'0',
		OUTPUT_GIF
	]
}

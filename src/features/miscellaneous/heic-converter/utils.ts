import { stem } from '../utils/format'
import { MAX_FILE_MB } from './constants'
import type { TImageFormat } from './types'

const HEIC_EXTENSION = /\.(?:heic|heif)$/i
const HEIC_MIME = /^image\/(?:heic|heif)$/i

export function isHeicFile(file: File): boolean {
	return HEIC_EXTENSION.test(file.name) || HEIC_MIME.test(file.type)
}

export function validateHeicFile(file: File): string | null {
	if (!isHeicFile(file)) return `${file.name} is not a HEIC or HEIF image.`
	if (file.size > MAX_FILE_MB * 1024 * 1024) {
		return `${file.name} is larger than ${MAX_FILE_MB} MB.`
	}
	return null
}

export function outputName(
	sourceName: string,
	format: TImageFormat,
	index?: number
): string {
	const suffix = index === undefined ? '' : `-${index + 1}`
	const extension = format === 'jpeg' ? 'jpg' : 'png'
	return `${stem(sourceName)}${suffix}.${extension}`
}

export function outputMime(format: TImageFormat): string {
	return format === 'jpeg' ? 'image/jpeg' : 'image/png'
}

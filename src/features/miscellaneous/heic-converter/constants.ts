export const ACCEPTED_INPUT = '.heic,.heif,image/heic,image/heif'
export const MAX_FILES = 12
export const MAX_FILE_MB = 40

export const FORMAT_OPTIONS = [
	{
		value: 'jpeg',
		label: 'JPG',
		hint: 'Smaller files, best for photos'
	},
	{
		value: 'png',
		label: 'PNG',
		hint: 'Lossless output, usually much larger'
	}
] as const

export const DEFAULT_QUALITY = 0.9

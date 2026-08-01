export type TGifFps = '10' | '15' | '20' | '24'

export type TGifWidth = '320' | '480' | '640' | 'original'

export type TGifQuality = 'small' | 'balanced' | 'high'

export type TPersistedOptions = {
	version: 1
	fps: TGifFps
	width: TGifWidth
	quality: TGifQuality
}

export type TGifPreview = {
	url: string
	size: number
	seconds: number
}

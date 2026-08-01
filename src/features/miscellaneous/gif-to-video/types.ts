export type TVideoFormat = 'mp4' | 'webm'

export type TVideoQuality = 'small' | 'balanced' | 'high'

export type TPersistedOptions = {
	version: 1
	format: TVideoFormat
	quality: TVideoQuality
}

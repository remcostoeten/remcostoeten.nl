export type TGifFps = '10' | '12' | '16'

export type TGifPreset = {
	fps: number
	maxWidth: number
}

export type TStatusMode = 'idle' | 'processing' | 'success' | 'error'

export type TStatus = {
	message: string
	mode: TStatusMode
}

export type TOutputKind = 'mp4' | 'gif'

export type TOutputFile = {
	url: string
	name: string
	size: number
	kind: TOutputKind
}

export type TPersistedOptions = {
	version: 1
	muteAudio: boolean
	gifFps: TGifFps
}

export type TMediaStatusMode = 'idle' | 'processing' | 'success' | 'error'

export type TMediaStatus = {
	message: string
	mode: TMediaStatusMode
}

export type TTrimRange = {
	start: number
	end: number
}

export type TMediaOutput = {
	url: string
	name: string
	size: number
	mime: string
}

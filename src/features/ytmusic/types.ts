export interface YTMusicTrack {
	id: string
	name: string
	artist: string
	album: string
	url: string
	image: string
	played_at: string
	played_at_estimated: boolean
	played_at_label?: string
}

export type YTMusicStatus =
	| 'ok'
	| 'stale'
	| 'empty'
	| 'unconfigured'
	| 'unauthorized'
	| 'error'

export type YTMusicSource = 'youtube-music' | 'database' | 'none'

export interface YTMusicResult {
	status: YTMusicStatus
	source: YTMusicSource
	tracks: YTMusicTrack[]
	message: string
	credentialsConfigured: boolean
	isStale: boolean
	fetchedAt: string
	cacheUpdatedAt: string | null
}

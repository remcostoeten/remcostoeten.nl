export interface SyncResult {
	service: 'github' | 'spotify'
	newItems: number
	totalItems: number
	lastSyncAt: Date
	error?: string
}

export interface SpotifyRecentlyPlayedItem {
	track: {
		id: string
		name: string
		artists: Array<{ name: string }>
		album: {
			name: string
			images: Array<{ url: string }>
		}
		duration_ms: number
		external_urls: {
			spotify: string
		}
	}
	played_at: string
}

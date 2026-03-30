export function createSpotifyTrack(overrides: Record<string, unknown> = {}) {
	return {
		id: 'track-1',
		name: 'Coding in public',
		artist: 'Remco',
		album: 'Release Gate',
		url: 'https://open.spotify.com/track/track-1',
		image: 'https://i.scdn.co/image/track-1',
		played_at: '2026-03-30T06:00:00.000Z',
		...overrides
	}
}

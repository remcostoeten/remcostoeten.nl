import type { LastfmScrobble } from '@/server/lastfm/api'

export function createScrobble(
	index: number,
	overrides: Partial<LastfmScrobble> = {}
): LastfmScrobble {
	return {
		name: `Track ${index}`,
		url: `https://www.last.fm/music/Artist+${index}/_/Track+${index}`,
		artist: { '#text': `Artist ${index}` },
		album: { '#text': `Album ${index}` },
		image: [
			{
				size: 'small',
				'#text': `https://lastfm.freetls.fastly.net/s/${index}.jpg`
			},
			{
				size: 'extralarge',
				'#text': `https://lastfm.freetls.fastly.net/xl/${index}.jpg`
			}
		],
		date: { uts: String(Date.UTC(2026, 10, 14, 17, index) / 1000) },
		...overrides
	}
}

export function createNowPlaying(index: number) {
	return createScrobble(index, {
		date: undefined,
		'@attr': { nowplaying: 'true' }
	})
}

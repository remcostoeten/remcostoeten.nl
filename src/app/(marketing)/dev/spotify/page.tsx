import { Metadata } from 'next'
import { createPageMetadata } from '@/core/metadata/base'
import { SpotifyDevView } from '@/views/marketing/dev/spotify'

export const metadata: Metadata = createPageMetadata({
	title: 'Spotify Token Generator',
	description:
		'Developer tool to generate Spotify refresh tokens for API integration.',
	canonical: '/dev/spotify',
	noIndex: true
})

export default function Page() {
	return <SpotifyDevView />
}

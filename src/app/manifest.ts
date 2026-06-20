import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Remco Stoeten - Frontend Engineer',
		short_name: 'Remco Stoeten',
		description:
			'Dutch software engineer focused on front-end development with 10 years of experience across e-commerce, SaaS, government, and automotive projects.',
		start_url: '/',
		display: 'standalone',
		background_color: '#000000',
		theme_color: '#000000',
		icons: [
			{
				src: '/favicon.ico',
				sizes: 'any',
				type: 'image/x-icon'
			},
			{
				src: '/favicon.svg',
				sizes: 'any',
				type: 'image/svg+xml'
			},
			{
				src: '/icon-192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: '/icon-512.png',
				sizes: '512x512',
				type: 'image/png'
			},
			{
				src: '/icon-512-maskable.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable'
			}
		]
	}
}

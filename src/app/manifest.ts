import { MetadataRoute } from 'next'
import { siteDescription, siteTitle } from '@/core/config/site'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: siteTitle,
		short_name: 'Remco Stoeten',
		description: siteDescription,
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

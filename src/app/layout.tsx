import { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/shared/lib/cn'
import {
	WebsiteStructuredData,
	PersonStructuredData
} from '@/components/seo/structured-data'
import { AppProviders } from '@/components/providers/providers'
import { ThemeInitializer } from '@/components/theme-initializer'
import { baseUrl } from '@/core/config/site'
import './global.css'

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: {
		default: 'Remco Stoeten - Frontend Engineer',
		template: '%s | Remco Stoeten'
	},
	description:
		'Dutch software engineer focused on front-end development with 10 years of experience across e-commerce, SaaS, government, and automotive projects.',
	keywords: [
		'Remco Stoeten',
		'Frontend Engineer',
		'Software Engineer',
		'React Developer',
		'Next.js Developer',
		'TypeScript',
		'Tailwind CSS',
		'Web Development',
		'Netherlands'
	],
	authors: [{ name: 'Remco Stoeten', url: 'https://remcostoeten.nl' }],
	creator: 'Remco Stoeten',
	publisher: 'Remco Stoeten',
	formatDetection: {
		email: false,
		address: false,
		telephone: false
	},
	openGraph: {
		title: 'Remco Stoeten - Frontend Engineer',
		description:
			'Dutch software engineer focused on front-end development with 10 years of experience across e-commerce, SaaS, government, and automotive projects.',
		url: baseUrl,
		siteName: 'Remco Stoeten',
		locale: 'en_US',
		type: 'website',
		images: [
			{
				url: '/og',
				width: 1200,
				height: 630,
				alt: 'Remco Stoeten - Frontend Engineer'
			}
		]
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Remco Stoeten - Frontend Engineer',
		description:
			'Dutch software engineer focused on front-end development.',
		creator: '@remcostoeten',
		images: ['/og']
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1
		}
	},
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/favicon.svg', type: 'image/svg+xml' },
			{ url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
			{ url: '/icon-512.png', type: 'image/png', sizes: '512x512' }
		],
		shortcut: '/favicon.ico',
		apple: '/apple-icon.png'
	},
	manifest: '/manifest.webmanifest',
	other: {
		'dns-prefetch': ['//api.github.com', '//api.spotify.com']
	}
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				'bg-white text-black antialiased dark:bg-black dark:text-white',
				`${GeistSans.variable} ${GeistMono.variable} font-sans`
			)}
		>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||!t){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`
					}}
				/>
				<link rel="dns-prefetch" href="//api.github.com" />
				<link rel="dns-prefetch" href="//api.spotify.com" />
				<link
					rel="dns-prefetch"
					href="//avatars.githubusercontent.com"
				/>
				<link rel="dns-prefetch" href="//i.scdn.co" />
				<link
					rel="dns-prefetch"
					href="//yt3.googleusercontent.com"
				/>
				<link
					rel="preconnect"
					href="https://avatars.githubusercontent.com"
				/>
				<link rel="preconnect" href="https://i.scdn.co" />

				<ThemeInitializer />
				<WebsiteStructuredData />
				<PersonStructuredData />
			</head>
			<body
				className="antialiased bg-background text-foreground"
				suppressHydrationWarning
			>
				<AppProviders>{children}</AppProviders>
				<Script
					defer
					src="https://static.cloudflareinsights.com/beacon.min.js"
					data-cf-beacon='{"token":"32bdf382dc08494ab635789326c70d46"}'
				/>
			</body>
		</html>
	)
}

import './global.css'
import '@/modules/view-transitions/styles.css'
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Navbar, Footer } from '@/components/layout'
import { SiteAnnouncementBanner } from '@/components/announcement-banner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { baseUrl, siteConfig } from '@/core/config'
import { ViewTransitionsProvider } from '@/modules/view-transitions/provider'
import { TimezoneSection } from '@/modules/landing/timer'
import {Providers} from '@/components/providers'
import { ViewportIndicator } from '@/components/viewport-indicator'

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`
    },
    description: siteConfig.description,
    viewport: {
        width: 'device-width',
        initialScale: 1
    },
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author.name, url: baseUrl }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    formatDetection: {
        email: false,
        address: false,
        telephone: false
    },
    openGraph: {
        title: siteConfig.name,
        description: siteConfig.description,
        url: baseUrl,
        siteName: siteConfig.name,
        locale: siteConfig.locale,
        type: 'website',
        images: [
            {
                url: `${baseUrl}/og?title=${encodeURIComponent(siteConfig.name)}`,
                width: 1200,
                height: 630,
                alt: siteConfig.name
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        site: siteConfig.social.twitter,
        creator: siteConfig.social.twitter,
        title: siteConfig.name,
        description: siteConfig.description,
        images: [`${baseUrl}/og?title=${encodeURIComponent(siteConfig.name)}`]
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
    alternates: {
        canonical: baseUrl,
        types: {
            'application/rss+xml': `${baseUrl}/rss`
        }
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '32x32' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
    }
}

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
        <html

            lang="en"
            className={spaceGrotesk.variable}
            suppressHydrationWarning
        >
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=5"
                />
                <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
                <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
                <link rel="preconnect" href="https://vercel.live" crossOrigin="anonymous" />
            </head>
            <body className="bg-background text-foreground antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
                <SiteAnnouncementBanner />
                <a
                    href="#main-content"
                    className="skip-link"
                >
                    Skip to main content
                </a>
                <TimezoneSection />
                <ViewTransitionsProvider>
                    <main id="main-content" className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
                        <Navbar />
                        {children}
                        <Footer />
                        <Analytics />
                        <SpeedInsights />
                    </main>
                    <ViewportIndicator />
                </ViewTransitionsProvider>
            </body>
        </html>
        </Providers>
    )
}

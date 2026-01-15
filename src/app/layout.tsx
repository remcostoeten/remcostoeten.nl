import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/lib/utils'
import { WebsiteStructuredData, PersonStructuredData } from '@/components/seo/structured-data'
import { AppProviders } from '@/components/providers/providers'
import { WebVitalsReporter } from '@/components/seo/web-vitals-reporter'
import { baseUrl } from './sitemap'
import './global.css'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Remco Stoeten - Frontend Engineer',
    template: '%s | Remco Stoeten',
  },
  description: 'Dutch software engineer focused on front-end development with 8 years of experience across e-commerce, SaaS, and government e-learning projects.',
  keywords: [
    'Remco Stoeten',
    'Frontend Engineer',
    'Software Engineer',
    'React Developer',
    'Next.js Developer',
    'TypeScript',
    'Tailwind CSS',
    'Web Development',
    'Netherlands',
  ],
  authors: [{ name: 'Remco Stoeten', url: 'https://remcostoeten.nl' }],
  creator: 'Remco Stoeten',
  publisher: 'Remco Stoeten',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Remco Stoeten - Frontend Engineer',
    description: 'Dutch software engineer focused on front-end development with 8 years of experience across e-commerce, SaaS, and government e-learning projects.',
    url: baseUrl,
    siteName: 'Remco Stoeten',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Remco Stoeten - Frontend Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remco Stoeten - Frontend Engineer',
    description: 'Dutch software engineer focused on front-end development.',
    creator: '@remcostoeten',
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.webmanifest',
  other: {
    'dns-prefetch': ['//api.github.com', '//api.spotify.com'],
  },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.github.com" />
        <link rel="dns-prefetch" href="//api.spotify.com" />
        <link rel="dns-prefetch" href="//avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="//i.scdn.co" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://i.scdn.co" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <WebsiteStructuredData />
        <PersonStructuredData />
      </head>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <WebVitalsReporter />
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
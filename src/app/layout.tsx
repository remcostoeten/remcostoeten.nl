import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/lib/utils'
import { WebsiteStructuredData, PersonStructuredData } from '@/components/seo/structured-data'
import { AppProviders } from '@/components/providers/providers'
import { WebVitalsReporter } from '@/components/dev/web-vitals-reporter'
import { baseUrl } from './sitemap'
import './global.css'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Remco Stoeten - Frontend Engineer',
    template: '%s | Remco Stoeten',
  },
  description: 'Dutch software engineer focused on front-end development with 8 years of experience across e-commerce, SaaS, and government e-learning projects.',
  openGraph: {
    title: 'Remco Stoeten - Frontend Engineer',
    description: 'Dutch software engineer focused on front-end development with 8 years of experience across e-commerce, SaaS, and government e-learning projects.',
    url: baseUrl,
    siteName: 'Remco Stoeten',
    locale: 'en_US',
    type: 'website',
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
  },
  other: {
    'dns-prefetch': ['//api.github.com', '//api.spotify.com'],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        'scroll-smooth bg-white text-black antialiased dark:bg-black dark:text-white',
        `${GeistSans.variable} ${GeistMono.variable} font-sans`
      )}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
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
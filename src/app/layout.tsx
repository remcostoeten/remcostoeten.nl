import './global.css'
import type { Metadata } from 'next'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from '@/components/layout/footer'
import { PageTransition } from '@/components/layout/page-transition'
import { CustomQueryClientProvider } from '@/components/providers/query-client-provider'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { baseUrl } from './sitemap'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

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
    'dns-prefetch': '//api.github.com',
    'dns-prefetch': '//api.spotify.com',
  },
}


export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="en"
      className={cn(
        'dark',
        GeistSans.variable,
        GeistMono.variable
      )}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <CustomQueryClientProvider>
          <VimAuthProvider>
            <div className="min-h-screen w-full flex flex-col">
              <main className="py-8 md:py-12 max-w-2xl mx-auto w-full grow border-x border-border/50">
                <PageTransition>
                  {children}
                  <Toaster />
                </PageTransition>
              </main>
              <Footer />
            </div>
          </VimAuthProvider>
          <Analytics />
          <SpeedInsights />
        </CustomQueryClientProvider>
      </body>
    </html>
  )
}

// Service worker registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

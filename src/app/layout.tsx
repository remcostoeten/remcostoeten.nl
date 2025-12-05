import './global.css'
import type { Metadata } from 'next'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import { Navbar } from 'src/components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from 'src/components/footer'
import { PageTransition } from 'src/components/PageTransition'
import { baseUrl } from './sitemap'
import { ReactNode } from 'react'

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
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'dark',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased bg-background text-foreground"> 
        <div className="min-h-screen w-full flex flex-col">
          <main className="px-6 py-8 md:px-12 md:py-12 max-w-3xl mx-auto w-full grow">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

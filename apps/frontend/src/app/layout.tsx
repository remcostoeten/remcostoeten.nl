import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { ApiEnvironmentSwitcher, ApiEnvironmentIndicator } from "@/components/_api-environment-switcher";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Remco Stoeten - Software engineer',
  description: 'Sharing thoughts and projects about web development, React, Next.js, and building useful tools.',
  keywords: [
    'frontend',
    'React',
    'Next.js',
    'TypeScript',
    'web development',
    'software engineer',
    'projects',
    'tools'
  ],
  authors: [{ name: 'Remco Stoeten' }],
  creator: 'Remco Stoeten',
  publisher: 'Remco Stoeten',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://remcostoeten.nl'),
  openGraph: {
    title: 'Remco Stoeten - Software engineer',
    description: 'Sharing thoughts and projects about web development, React, Next.js, and building useful tools.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remco Stoeten - Software engineer',
    description: 'Sharing thoughts and projects about web development, React, Next.js, and building useful tools.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://framerusercontent.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external links */}
        <link rel="dns-prefetch" href="https://medium.com" />
        <link rel="dns-prefetch" href="https://substack.com" />
        <link rel="dns-prefetch" href="https://twitter.com" />
        <link rel="dns-prefetch" href="https://framer.com" />
        <link rel="dns-prefetch" href="https://producthunt.com" />
        <link rel="dns-prefetch" href="https://linkedin.com" />
      </head>
      <body className={`${inter.className} ${inter.variable} overflow-x-hidden`} suppressHydrationWarning>
        <TooltipProvider delayDuration={0}>
          <AnalyticsTracker />
          {children}
          <ApiEnvironmentSwitcher />
          <ApiEnvironmentIndicator />
        </TooltipProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

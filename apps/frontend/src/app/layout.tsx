import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WebVitals } from '@/components/performance';

// Optimize font loading with display swap and preload
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Frank Price - Product Designer & Writer',
  description: 'Thoughts on design, engineering, AI, and the random sparks of inspiration that keep me going.',
  keywords: ['design', 'engineering', 'AI', 'product design', 'blog', 'technology'],
  authors: [{ name: 'Frank Price' }],
  creator: 'Frank Price',
  publisher: 'Frank Price',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://frankprice.dev'),
  openGraph: {
    title: 'Frank Price - Product Designer & Writer',
    description: 'Thoughts on design, engineering, AI, and the random sparks of inspiration that keep me going.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frank Price - Product Designer & Writer',
    description: 'Thoughts on design, engineering, AI, and the random sparks of inspiration that keep me going.',
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
      <body className={`${inter.className} ${inter.variable}`}>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
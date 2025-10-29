import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Sans } from 'next/font/google';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/next"

import { Analytics } from "@vercel/analytics/next";
import { ClientOnlyWrapper } from "@/components/client-only-wrapper";
import { TimezoneSection } from "@/modules/sections";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-sans'
});

export const metadata: Metadata = {
  title: 'Remco Stoeten | Software Engineer | React & Next.js Developer',
  description: 'Remco Stoeten is a software engineer specializing in React, Next.js, and TypeScript. Building modern web applications and sharing development insights. Portfolio, blog, and projects.',
  keywords: [
    'Remco Stoeten',
    'Stoeten',
    'software engineer',
    'React developer',
    'Next.js developer',
    'TypeScript',
    'frontend engineer',
    'web development',
    'React',
    'Next.js',
    'JavaScript',
    'full-stack developer',
    'portfolio',
    'blog'
  ],
  authors: [{ name: 'Remco Stoeten', url: 'https://remcostoeten.nl' }],
  creator: 'Remco Stoeten',
  publisher: 'Remco Stoeten',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://remcostoeten.nl'),
  alternates: {
    types: {
      'application/rss+xml': '/rss',
    },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  manifest: '/manifest.json',
  other: {
    'geo.region': 'NL',
    'geo.placename': 'Netherlands',
    'profile:first_name': 'Remco',
    'profile:last_name': 'Stoeten',
  },
  openGraph: {
    title: 'Remco Stoeten | Software Engineer | React & Next.js Developer',
    description: 'Remco Stoeten is a software engineer specializing in React, Next.js, and TypeScript. Building modern web applications and sharing development insights.',
    url: 'https://remcostoeten.nl',
    siteName: 'Remco Stoeten',
    type: 'profile',
    locale: 'en_US',
    images: [
      {
        url: 'https://remcostoeten.nl/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Remco Stoeten - Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remco Stoeten - Software Engineer',
    description: 'Software engineer specializing in React, Next.js, and TypeScript. Portfolio, blog, and projects.',
    creator: '@remcostoeten',
    site: '@remcostoeten',
    images: ['https://remcostoeten.nl/og-image.png'],
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
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Remco Stoeten',
    alternateName: 'Stoeten',
    url: 'https://remcostoeten.nl',
    image: 'https://remcostoeten.nl/remco-stoeten.jpg',
    jobTitle: 'Software Engineer',
    description: 'Software engineer specializing in React, Next.js, TypeScript, and modern web development. Building useful tools and sharing knowledge.',
    worksFor: {
      '@type': 'Organization',
      name: 'Independent',
    },
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Frontend Development',
      'Web Development',
      'Software Engineering',
      'UI/UX Development',
    ],
    sameAs: [
      'https://github.com/remcostoeten',
      'https://twitter.com/remcostoeten',
      'https://linkedin.com/in/remcostoeten',
    ],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Self-taught Developer',
    },
    birthPlace: {
      '@type': 'Place',
      name: 'Netherlands',
    },
    nationality: {
      '@type': 'Country',
      name: 'Netherlands',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Remco Stoeten',
    alternateName: 'Stoeten',
    url: 'https://remcostoeten.nl',
    description: 'Personal website and blog of Remco Stoeten, software engineer specializing in React and Next.js',
    author: {
      '@type': 'Person',
      name: 'Remco Stoeten',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://remcostoeten.nl/posts?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      '@id': 'https://remcostoeten.nl/#person',
      name: 'Remco Stoeten',
      givenName: 'Remco',
      familyName: 'Stoeten',
      alternateName: ['Stoeten', 'Remco'],
      url: 'https://remcostoeten.nl',
      image: 'https://remcostoeten.nl/remco-stoeten.jpg',
      jobTitle: 'Software Engineer',
      description: 'Software engineer specializing in React, Next.js, TypeScript, and modern web development',
      knowsAbout: [
        'React',
        'Next.js',
        'TypeScript',
        'JavaScript',
        'Frontend Development',
        'Web Development',
        'Software Engineering',
      ],
      sameAs: [
        'https://github.com/remcostoeten',
        'https://twitter.com/remcostoeten',
        'https://linkedin.com/in/remcostoeten',
      ],
    },
  };

  const siteNavigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'SiteNavigationElement', name: 'Home', url: 'https://remcostoeten.nl' },
      { '@type': 'SiteNavigationElement', name: 'Blog', url: 'https://remcostoeten.nl/posts' },
      { '@type': 'SiteNavigationElement', name: 'Analytics', url: 'https://remcostoeten.nl/analytics' },
      { '@type': 'SiteNavigationElement', name: 'Contact', url: 'https://remcostoeten.nl/contact' },
    ]
  };

  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} ${notoSans.variable} overflow-x-hidden`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
        />
        <ClientOnlyWrapper>
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
          <TimezoneSection />
          
        </ClientOnlyWrapper>
        <Toaster richColors position="bottom-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

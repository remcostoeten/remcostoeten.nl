const DEFAULT_SITE_URL = 'https://remcostoeten.nl'

function normalizeUrl(url: string) {
  if (!url) {
    return DEFAULT_SITE_URL
  }

  const withProtocol = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`

  return withProtocol.replace(/\/+$/, '')
}

const siteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL)

export const siteConfig = {
  name: 'Remco Stoeten',
  description:
    'Remco Stoeten is a senior software engineer sharing deep dives on modern web performance, engineering leadership, and building for the open web.',
  url: siteUrl,
  author: {
    name: 'Remco Stoeten',
  },
  social: {
    twitter: '@remcostoeten',
    github: 'remcostoeten',
  },
  defaultOgImage: '/og?title=Remco%20Stoeten',
}

export const baseUrl = siteConfig.url

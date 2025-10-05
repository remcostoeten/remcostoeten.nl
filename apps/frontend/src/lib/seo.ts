import type { Metadata } from 'next';

type TSeoInput = {
  title: string;
  description: string;
  url: string;
  image?: string;
};

export function buildSeo({ title, description, url, image = 'https://remcostoeten.nl/og-image.png' }: TSeoInput): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      title,
      description,
      url,
      siteName: 'Remco Stoeten',
      locale: 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@remcostoeten',
      site: '@remcostoeten',
    },
  };
}



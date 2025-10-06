import { TBlogPost, TBlogCategory } from './types';

export type TSeoConfig = {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  author: string;
  twitterHandle?: string;
  defaultImage?: string;
};

export const defaultSeoConfig: TSeoConfig = {
  siteName: "Remco Stoeten",
  siteUrl: "https://remcostoeten.nl",
  siteDescription: "Thoughts on frontend development, design, and building better web experiences.",
  author: "Remco Stoeten",
  twitterHandle: "@yowremco",
  defaultImage: "/og-image.jpg"
};

export function generatePostSeo(post: TBlogPost, config: TSeoConfig = defaultSeoConfig) {
  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  const keywords = post.seo?.keywords || post.tags;
  const url = `${config.siteUrl}/posts/${post.slug}`;
  const publishedTime = new Date(post.publishedAt).toISOString();
  const modifiedTime = publishedTime; // You could track this separately

  return {
    title: `${title} | ${config.siteName}`,
    description,
    keywords: keywords.join(', '),
    url,
    publishedTime,
    modifiedTime,
    author: post.author || config.author,
    category: post.category,
    tags: post.tags,
    readTime: post.readTime,
    wordCount: post.content.split(' ').length,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [post.author || config.author],
      section: post.category,
      tags: post.tags,
      siteName: config.siteName,
      images: [
        {
          url: `${config.siteUrl}${config.defaultImage}`,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: config.twitterHandle,
      images: [`${config.siteUrl}${config.defaultImage}`]
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      datePublished: publishedTime,
      dateModified: modifiedTime,
      author: {
        '@type': 'Person',
        name: post.author || config.author
      },
      publisher: {
        '@type': 'Organization',
        name: config.siteName,
        url: config.siteUrl
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      },
      keywords: keywords.join(', '),
      wordCount: post.content.split(' ').length,
      timeRequired: `PT${post.readTime}M`,
      articleSection: post.category,
      about: post.tags.map(tag => ({
        '@type': 'Thing',
        name: tag
      }))
    }
  };
}

export function generateCategorySeo(category: TBlogCategory, config: TSeoConfig = defaultSeoConfig) {
  const categoryNames: Record<TBlogCategory, string> = {
    'all': 'All Posts',
    'development': 'Development',
    'design': 'Design',
    'best-practices': 'Best Practices'
  };

  const categoryName = categoryNames[category];
  const title = `${categoryName} | ${config.siteName}`;
  const description = `Explore ${categoryName.toLowerCase()} articles and insights on ${config.siteName}.`;
  const url = category === 'all' ? `${config.siteUrl}/posts` : `${config.siteUrl}/posts?category=${category}`;

  return {
    title,
    description,
    url,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: config.siteName,
      images: [
        {
          url: `${config.siteUrl}${config.defaultImage}`,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: config.twitterHandle,
      images: [`${config.siteUrl}${config.defaultImage}`]
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url,
      mainEntity: {
        '@type': 'ItemList',
        name: `${categoryName} Posts`,
        description: `A collection of ${categoryName.toLowerCase()} posts`
      }
    }
  };
}

export function generateBlogListSeo(config: TSeoConfig = defaultSeoConfig) {
  const title = `Blog | ${config.siteName}`;
  const description = config.siteDescription;
  const url = `${config.siteUrl}/posts`;

  return {
    title,
    description,
    url,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: config.siteName,
      images: [
        {
          url: `${config.siteUrl}${config.defaultImage}`,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: config.twitterHandle,
      images: [`${config.siteUrl}${config.defaultImage}`]
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: title,
      description,
      url,
      publisher: {
        '@type': 'Organization',
        name: config.siteName,
        url: config.siteUrl
      }
    }
  };
}

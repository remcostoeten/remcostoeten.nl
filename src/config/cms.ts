type TCMSTheme = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
      heading: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
};

type TCMSLayout = {
  container: {
    maxWidth: string;
    padding: string;
    className: string;
  };
  header: {
    height: string;
    sticky: boolean;
    blur: boolean;
    className: string;
  };
  sidebar: {
    width: string;
    collapsedWidth: string;
    className: string;
  };
  footer: {
    height: string;
    className: string;
  };
  grid: {
    columns: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    gap: string;
  };
};

type TCMSContent = {
  meta: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultKeywords: string[];
    ogImage: string;
    twitterCard: 'summary' | 'summary_large_image';
    language: string;
    locale: string;
  };
  branding: {
    logo: {
      light: string;
      dark: string;
      alt: string;
      width: number;
      height: number;
    };
    favicon: {
      ico: string;
      svg: string;
      apple: string;
      manifest: string;
    };
  };
  navigation: {
    maxItems: number;
    showBreadcrumbs: boolean;
    showSearchInNav: boolean;
  };
  editor: {
    defaultBlocks: string[];
    allowedFormats: string[];
    maxFileSize: number;
    allowedFileTypes: string[];
  };
};

type TCMSFeatures = {
  analytics: {
    enabled: boolean;
    provider: 'custom' | 'google' | 'vercel';
    trackingId?: string;
  };
  search: {
    enabled: boolean;
    provider: 'local' | 'algolia' | 'elasticsearch';
    placeholder: string;
    maxResults: number;
  };
  comments: {
    enabled: boolean;
    provider: 'custom' | 'disqus' | 'giscus';
    moderation: boolean;
  };
  newsletter: {
    enabled: boolean;
    provider: 'custom' | 'mailchimp' | 'convertkit';
    placeholder: string;
  };
  darkMode: {
    enabled: boolean;
    defaultTheme: 'light' | 'dark' | 'system';
    storageKey: string;
  };
  i18n: {
    enabled: boolean;
    defaultLocale: string;
    locales: string[];
    fallbackLocale: string;
  };
};

type TCMSConfig = {
  theme: TCMSTheme;
  layout: TCMSLayout;
  content: TCMSContent;
  features: TCMSFeatures;
  performance: {
    imageOptimization: boolean;
    lazyLoading: boolean;
    prefetching: boolean;
    caching: {
      staticAssets: number;
      apiResponses: number;
    };
  };
  seo: {
    generateSitemap: boolean;
    generateRobots: boolean;
    canonicalUrls: boolean;
    openGraph: boolean;
    twitterCards: boolean;
    structuredData: boolean;
  };
};

function createCMSConfig(): TCMSConfig {
  return {
    theme: {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--card))',
        text: {
          primary: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--muted-foreground))',
          muted: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        success: 'hsl(142, 76%, 36%)',
        warning: 'hsl(38, 92%, 50%)',
        error: 'hsl(var(--destructive))',
      },
      typography: {
        fontFamily: {
          sans: 'system-ui, -apple-system, sans-serif',
          mono: 'JetBrains Mono, Consolas, monospace',
          heading: 'Inter, system-ui, sans-serif',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
    },
    layout: {
      container: {
        maxWidth: '1400px',
        padding: '2rem',
        className: 'container mx-auto px-4 sm:px-6 lg:px-8',
      },
      header: {
        height: '4rem',
        sticky: true,
        blur: true,
        className: 'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      },
      sidebar: {
        width: '16rem',
        collapsedWidth: '4rem',
        className: 'border-r bg-muted/40',
      },
      footer: {
        height: 'auto',
        className: 'border-t bg-muted/40',
      },
      grid: {
        columns: {
          sm: 1,
          md: 2,
          lg: 3,
          xl: 4,
        },
        gap: '1.5rem',
      },
    },
    content: {
      meta: {
        defaultTitle: 'CMS',
        titleTemplate: '%s | CMS',
        defaultDescription: 'A modern content management system built with Next.js and TypeScript',
        defaultKeywords: ['cms', 'nextjs', 'typescript', 'react'],
        ogImage: '/og-image.png',
        twitterCard: 'summary_large_image',
        language: 'en',
        locale: 'en_US',
      },
      branding: {
        logo: {
          light: '/logo-light.svg',
          dark: '/logo-dark.svg',
          alt: 'CMS Logo',
          width: 120,
          height: 40,
        },
        favicon: {
          ico: '/favicon.ico',
          svg: '/favicon.svg',
          apple: '/apple-touch-icon.png',
          manifest: '/site.webmanifest',
        },
      },
      navigation: {
        maxItems: 8,
        showBreadcrumbs: true,
        showSearchInNav: true,
      },
      editor: {
        defaultBlocks: ['paragraph', 'heading', 'list', 'quote', 'code', 'image'],
        allowedFormats: ['bold', 'italic', 'underline', 'code', 'link'],
        maxFileSize: 10 * 1024 * 1024,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      },
    },
    features: {
      analytics: {
        enabled: true,
        provider: 'custom',
      },
      search: {
        enabled: true,
        provider: 'local',
        placeholder: 'Search...',
        maxResults: 10,
      },
      comments: {
        enabled: false,
        provider: 'custom',
        moderation: true,
      },
      newsletter: {
        enabled: false,
        provider: 'custom',
        placeholder: 'Enter your email...',
      },
      darkMode: {
        enabled: true,
        defaultTheme: 'system',
        storageKey: 'theme',
      },
      i18n: {
        enabled: false,
        defaultLocale: 'en',
        locales: ['en'],
        fallbackLocale: 'en',
      },
    },
    performance: {
      imageOptimization: true,
      lazyLoading: true,
      prefetching: true,
      caching: {
        staticAssets: 31536000,
        apiResponses: 300,
      },
    },
    seo: {
      generateSitemap: true,
      generateRobots: true,
      canonicalUrls: true,
      openGraph: true,
      twitterCards: true,
      structuredData: true,
    },
  };
}

export const CMS_CONFIG: TCMSConfig = createCMSConfig();

export function getCMSConfig(): TCMSConfig {
  return CMS_CONFIG;
}

export function getThemeConfig() {
  return CMS_CONFIG.theme;
}

export function getLayoutConfig() {
  return CMS_CONFIG.layout;
}

export function getContentConfig() {
  return CMS_CONFIG.content;
}

export function getFeaturesConfig() {
  return CMS_CONFIG.features;
}

export function isFeatureEnabled(feature: keyof TCMSFeatures): boolean {
  return CMS_CONFIG.features[feature].enabled;
}

export function getContainerClassName(): string {
  return CMS_CONFIG.layout.container.className;
}

export function getHeaderClassName(): string {
  return CMS_CONFIG.layout.header.className;
}

export function getPageTitle(title?: string): string {
  if (!title) return CMS_CONFIG.content.meta.defaultTitle;
  return CMS_CONFIG.content.meta.titleTemplate.replace('%s', title);
}

export function getMetaDescription(description?: string): string {
  return description || CMS_CONFIG.content.meta.defaultDescription;
}

// Blog system configuration
export const BLOG_CONFIG = {
  // Content directory
  CONTENT_DIR: 'content/blog',

  // Default values
  DEFAULTS: {
    category: 'development' as const,
    status: 'published' as const,
    readTime: 5,
  },

  // Features
  FEATURES: {
    admin: true,
    cli: true,
    fallback: true,
  },
} as const;

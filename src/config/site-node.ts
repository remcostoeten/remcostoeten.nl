type TSiteConfig = {
  site: {
    title: string;
    description: string;
    url: string;
  };
  contact: {
    email: string;
  };
  social: {
    x: string;
    github: string;
    behance: string;
    telegram: string;
  };
  analytics: {
    adminPassword: string;
    sessionTimeout: number;
    realtimeInterval: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  api: {
    allowedOrigins: string[];
  };
};

export const SITE_CONFIG: TSiteConfig = {
  site: {
    title: process.env.VITE_SITE_TITLE || "Portfolio Site",
    description: process.env.VITE_SITE_DESCRIPTION || "A modern portfolio website",
    url: process.env.VITE_SITE_URL || "https://example.com",
  },
  contact: {
    email: process.env.VITE_CONTACT_EMAIL || "contact@example.com",
  },
  social: {
    x: process.env.VITE_SOCIAL_X || "",
    github: process.env.VITE_SOCIAL_GITHUB || "",
    behance: process.env.VITE_SOCIAL_BEHANCE || "",
    telegram: process.env.VITE_SOCIAL_TELEGRAM || "",
  },
  analytics: {
    adminPassword: process.env.VITE_ANALYTICS_PASSWORD || "change-me",
    sessionTimeout: 24 * 60 * 60 * 1000,
    realtimeInterval: 30 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
  },
  api: {
    allowedOrigins: process.env.VITE_ALLOWED_ORIGINS 
      ? process.env.VITE_ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3333',
          'http://localhost:3334',
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:3333',
          'http://127.0.0.1:3334',
          'http://127.0.0.1:5173'
        ],
  },
};

export function getSiteConfig(): TSiteConfig {
  return SITE_CONFIG;
}

export function isProductionConfigured(): boolean {
  return (
    SITE_CONFIG.analytics.adminPassword !== "change-me" &&
    SITE_CONFIG.site.url !== "https://example.com" &&
    SITE_CONFIG.contact.email !== "contact@example.com"
  );
}

export function getConfigWarnings(): string[] {
  const warnings: string[] = [];
  
  if (SITE_CONFIG.analytics.adminPassword === "change-me") {
    warnings.push("⚠️ Default analytics password in use! Set VITE_ANALYTICS_PASSWORD environment variable");
  }
  
  if (SITE_CONFIG.site.url === "https://example.com") {
    warnings.push("⚠️ Default site URL in use! Set NEXT_PUBLIC_SITE_URL environment variable");
  }
  
  if (SITE_CONFIG.contact.email === "contact@example.com") {
    warnings.push("⚠️ Default contact email in use! Set NEXT_PUBLIC_CONTACT_EMAIL environment variable");
  }
  
  return warnings;
}

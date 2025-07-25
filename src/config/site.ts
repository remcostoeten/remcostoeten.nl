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

function getEnvironment() {
  if (typeof window !== 'undefined') {
    return import.meta.env;
  }
  return process.env;
}

function createSiteConfig(): TSiteConfig {
  const env = getEnvironment();
  
  return {
    site: {
      title: env.VITE_SITE_TITLE || "",
      description: env.VITE_SITE_DESCRIPTION || "",
      url: env.VITE_SITE_URL || "",
    },
    contact: {
      email: env.VITE_CONTACT_EMAIL || "",
    },
    social: {
      x: env.VITE_SOCIAL_X || "",
      github: env.VITE_SOCIAL_GITHUB || "",
      behance: env.VITE_SOCIAL_BEHANCE || "",
      telegram: env.VITE_SOCIAL_TELEGRAM || "",
    },
    analytics: {
      adminPassword: env.VITE_ANALYTICS_PASSWORD || "",
      sessionTimeout: 24 * 60 * 60 * 1000,
      realtimeInterval: 30 * 1000,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000,
    },
    api: {
      allowedOrigins: env.VITE_ALLOWED_ORIGINS 
        ? env.VITE_ALLOWED_ORIGINS.split(',')
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
}

export const SITE_CONFIG: TSiteConfig = createSiteConfig();

export function getSiteConfig(): TSiteConfig {
  return SITE_CONFIG;
}

export function isProductionConfigured(): boolean {
  return (
    SITE_CONFIG.analytics.adminPassword !== "" && 
    SITE_CONFIG.site.url !== "" &&
    SITE_CONFIG.contact.email !== ""
  );
}

export function getConfigWarnings(): string[] {
  const warnings: string[] = [];
  
  if (!SITE_CONFIG.analytics.adminPassword) {
    warnings.push("⚠️ Analytics password not configured! Set VITE_ANALYTICS_PASSWORD environment variable");
  }
  
  if (!SITE_CONFIG.site.url) {
    warnings.push("⚠️ Site URL not configured! Set VITE_SITE_URL environment variable");
  }
  
  if (!SITE_CONFIG.contact.email) {
    warnings.push("⚠️ Contact email not configured! Set VITE_CONTACT_EMAIL environment variable");
  }
  
  return warnings;
}

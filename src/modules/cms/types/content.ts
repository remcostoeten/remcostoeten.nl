export type CMSContent = {
  id: string;
  type: ContentType;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
};

export type ContentType = 
  | 'page'
  | 'hero'
  | 'about'
  | 'project'
  | 'contact'
  | 'settings'
  | 'navigation';

export type HeroContent = CMSContent & {
  type: 'hero';
  data: {
    title: string;
    subtitle?: string;
    description: string;
    ctaText?: string;
    ctaUrl?: string;
    backgroundImage?: string;
    profileImage?: string;
  };
};

export type AboutContent = CMSContent & {
  type: 'about';
  data: {
    title: string;
    content: string;
    skills?: string[];
    experience?: ExperienceItem[];
    image?: string;
  };
};

export type ExperienceItem = {
  title: string;
  company: string;
  period: string;
  description: string;
};

export type ProjectContent = CMSContent & {
  type: 'project';
  data: {
    title: string;
    description: string;
    longDescription?: string;
    url?: string;
    demoUrl?: string;
    githubUrl?: string;
    technologies: string[];
    category: string;
    featured: boolean;
    images: ProjectImage[];
    status: 'completed' | 'in-progress' | 'planned';
    startDate: string;
    endDate?: string;
    highlights: string[];
    metrics?: ProjectMetrics;
  };
};

export type ProjectImage = {
  url: string;
  alt: string;
  caption?: string;
  isHero?: boolean;
};

export type ProjectMetrics = {
  stars?: number;
  forks?: number;
  downloads?: number;
  users?: number;
};

export type ContactContent = CMSContent & {
  type: 'contact';
  data: {
    title: string;
    description: string;
    email: string;
    phone?: string;
    location?: string;
    timezone: string;
    socialLinks: SocialLink[];
    availability: {
      status: 'available' | 'busy' | 'unavailable';
      message?: string;
    };
  };
};

export type SocialLink = {
  platform: string;
  url: string;
  username?: string;
  icon?: string;
};

export type PageContent = CMSContent & {
  type: 'page';
  data: {
    title: string;
    description?: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    sections: PageSection[];
  };
};

export type PageSection = {
  id: string;
  type: 'hero' | 'about' | 'projects' | 'contact' | 'custom';
  enabled: boolean;
  order: number;
  settings?: Record<string, any>;
};

export type SiteSettings = CMSContent & {
  type: 'settings';
  data: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    logo?: string;
    favicon?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      mode: 'light' | 'dark' | 'system';
    };
    seo: {
      defaultTitle: string;
      defaultDescription: string;
      keywords: string[];
      ogImage?: string;
    };
    analytics?: {
      googleAnalytics?: string;
      facebookPixel?: string;
    };
  };
};

export type NavigationContent = CMSContent & {
  type: 'navigation';
  data: {
    items: NavigationItem[];
  };
};

export type NavigationItem = {
  id: string;
  label: string;
  url: string;
  external?: boolean;
  order: number;
  children?: NavigationItem[];
};

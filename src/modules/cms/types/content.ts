export type TCMSContent = {
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

export type THeroContent = TCMSContent & {
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

export type TAboutContent = TCMSContent & {
  type: 'about';
  data: {
    title: string;
    content: string;
    skills?: string[];
    experience?: TExperienceItem[];
    image?: string;
  };
};

export type TExperienceItem = {
  title: string;
  company: string;
  period: string;
  description: string;
};

export type TProjectContent = TCMSContent & {
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
    images: TProjectImage[];
    status: 'completed' | 'in-progress' | 'planned';
    startDate: string;
    endDate?: string;
    highlights: string[];
    metrics?: TProjectMetrics;
  };
};

export type TProjectImage = {
  url: string;
  alt: string;
  caption?: string;
  isHero?: boolean;
};

export type TProjectMetrics = {
  stars?: number;
  forks?: number;
  downloads?: number;
  users?: number;
};

export type TContactContent = TCMSContent & {
  type: 'contact';
  data: {
    title: string;
    description: string;
    email: string;
    phone?: string;
    location?: string;
    timezone: string;
    socialLinks: TSocialLink[];
    availability: {
      status: 'available' | 'busy' | 'unavailable';
      message?: string;
    };
  };
};

export type TSocialLink = {
  platform: string;
  url: string;
  username?: string;
  icon?: string;
};

export type TPageContent = TCMSContent & {
  type: 'page';
  data: {
    title: string;
    description?: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    sections: TPageSection[];
  };
};

export type TPageSection = {
  id: string;
  type: 'hero' | 'about' | 'projects' | 'contact' | 'custom';
  enabled: boolean;
  order: number;
  settings?: Record<string, any>;
};

export type TSiteSettings = TCMSContent & {
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

export type TNavigationContent = TCMSContent & {
  type: 'navigation';
  data: {
    items: TNavigationItem[];
  };
};

export type TNavigationItem = {
  id: string;
  label: string;
  url: string;
  external?: boolean;
  order: number;
  children?: TNavigationItem[];
};

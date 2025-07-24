import { 
  HeroContent, 
  AboutContent, 
  ProjectContent, 
  ContactContent,
  SiteSettings,
  NavigationContent 
} from '../types/content';
import { CMSResponse } from '../types/api';

// Static data adapter for development/fallback
export class StaticCMSAdapter {
  private static heroContent: HeroContent = {
    id: 'hero-1',
    type: 'hero',
    slug: 'hero',
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    data: {
      title: "Alex Jordan",
      subtitle: "Full Stack Developer",
      description: "Building beautiful and functional web applications with modern technologies.",
      ctaText: "View My Work",
      ctaUrl: "#projects"
    }
  };

  private static aboutContent: AboutContent = {
    id: 'about-1',
    type: 'about',
    slug: 'about',
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    data: {
      title: "About Me",
      content: "I'm a passionate full stack developer with over 5 years of experience creating digital solutions. I specialize in React, Node.js, and modern web technologies.",
      skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
      experience: [
        {
          title: "Senior Developer",
          company: "TechCorp",
          period: "2022 - Present",
          description: "Lead development of enterprise applications"
        },
        {
          title: "Full Stack Developer",
          company: "StartupXYZ",
          period: "2020 - 2022",
          description: "Built scalable web applications from scratch"
        }
      ]
    }
  };

  private static projectsContent: ProjectContent[] = [
    {
      id: 'project-1',
      type: 'project',
      slug: 'ecommerce-platform',
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      data: {
        title: "E-commerce Platform",
        description: "A modern e-commerce solution with real-time inventory management",
        longDescription: "Built a comprehensive e-commerce platform featuring real-time inventory tracking, payment processing, and admin dashboard.",
        url: "https://example.com",
        demoUrl: "https://demo.example.com",
        githubUrl: "https://github.com/user/project",
        technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
        category: "Web Application",
        featured: true,
        images: [
          {
            url: "/placeholder.svg",
            alt: "E-commerce platform screenshot",
            isHero: true
          }
        ],
        status: "completed",
        startDate: "2023-01-01",
        endDate: "2023-06-01",
        highlights: [
          "Real-time inventory updates",
          "Integrated payment processing",
          "Admin dashboard with analytics"
        ],
        metrics: {
          stars: 156,
          forks: 23
        }
      }
    },
    {
      id: 'project-2',
      type: 'project',
      slug: 'task-management-app',
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      data: {
        title: "Task Management App",
        description: "Collaborative task management with real-time updates",
        technologies: ["Vue.js", "Firebase", "Tailwind CSS"],
        category: "Mobile App",
        featured: false,
        images: [
          {
            url: "/placeholder.svg",
            alt: "Task management app screenshot"
          }
        ],
        status: "completed",
        startDate: "2023-07-01",
        highlights: [
          "Real-time collaboration",
          "Drag and drop interface",
          "Mobile responsive design"
        ]
      }
    }
  ];

  private static contactContent: ContactContent = {
    id: 'contact-1',
    type: 'contact',
    slug: 'contact',
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    data: {
      title: "Get In Touch",
      description: "I'm always open to discussing new opportunities and interesting projects.",
      email: "alex@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      timezone: "UTC+1",
      socialLinks: [
        {
          platform: "GitHub",
          url: "https://github.com",
          username: "alexjordan",
          icon: "github"
        },
        {
          platform: "LinkedIn",
          url: "https://linkedin.com",
          username: "alexjordan",
          icon: "linkedin"
        },
        {
          platform: "Twitter",
          url: "https://twitter.com",
          username: "alexjordan",
          icon: "twitter"
        }
      ],
      availability: {
        status: "available",
        message: "Available for new projects"
      }
    }
  };

  private static siteSettings: SiteSettings = {
    id: 'settings-1',
    type: 'settings',
    slug: 'site-settings',
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    data: {
      siteName: "Alex Jordan - Portfolio",
      siteDescription: "Full Stack Developer Portfolio",
      siteUrl: "https://alexjordan.dev",
      theme: {
        primaryColor: "hsl(262, 83%, 58%)",
        secondaryColor: "hsl(252, 56%, 57%)",
        accentColor: "hsl(262, 83%, 58%)",
        mode: "system"
      },
      seo: {
        defaultTitle: "Alex Jordan - Full Stack Developer",
        defaultDescription: "Experienced full stack developer specializing in React, Node.js, and modern web technologies.",
        keywords: ["full stack developer", "react", "node.js", "typescript", "web development"],
        ogImage: "/og-image.jpg"
      }
    }
  };

  private static navigationContent: NavigationContent = {
    id: 'nav-1',
    type: 'navigation',
    slug: 'main-navigation',
    status: 'published',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    data: {
      items: [
        {
          id: 'nav-home',
          label: 'Home',
          url: '/',
          order: 1
        },
        {
          id: 'nav-about',
          label: 'About',
          url: '#about',
          order: 2
        },
        {
          id: 'nav-projects',
          label: 'Projects',
          url: '#projects',
          order: 3
        },
        {
          id: 'nav-contact',
          label: 'Contact',
          url: '#contact',
          order: 4
        }
      ]
    }
  };

  static async getHeroContent(): Promise<CMSResponse<HeroContent>> {
    await this.delay(100); // Simulate network delay
    return { success: true, data: this.heroContent };
  }

  static async getAboutContent(): Promise<CMSResponse<AboutContent>> {
    await this.delay(100);
    return { success: true, data: this.aboutContent };
  }

  static async getProjects(featured?: boolean): Promise<CMSResponse<ProjectContent[]>> {
    await this.delay(100);
    let projects = this.projectsContent;
    
    if (featured !== undefined) {
      projects = projects.filter(p => p.data.featured === featured);
    }
    
    return { success: true, data: projects };
  }

  static async getContactContent(): Promise<CMSResponse<ContactContent>> {
    await this.delay(100);
    return { success: true, data: this.contactContent };
  }

  static async getSiteSettings(): Promise<CMSResponse<SiteSettings>> {
    await this.delay(100);
    return { success: true, data: this.siteSettings };
  }

  static async getNavigation(): Promise<CMSResponse<NavigationContent>> {
    await this.delay(100);
    return { success: true, data: this.navigationContent };
  }

  // Helper method to simulate network delay
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Methods to update static content (for development)
  static updateHeroContent(content: Partial<HeroContent['data']>): void {
    this.heroContent.data = { ...this.heroContent.data, ...content };
    this.heroContent.updatedAt = new Date().toISOString();
  }

  static updateAboutContent(content: Partial<AboutContent['data']>): void {
    this.aboutContent.data = { ...this.aboutContent.data, ...content };
    this.aboutContent.updatedAt = new Date().toISOString();
  }

  static addProject(project: Omit<ProjectContent, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newProject: ProjectContent = {
      ...project,
      id: `project-${this.projectsContent.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projectsContent.push(newProject);
  }

  static updateSiteSettings(settings: Partial<SiteSettings['data']>): void {
    this.siteSettings.data = { ...this.siteSettings.data, ...settings };
    this.siteSettings.updatedAt = new Date().toISOString();
  }
}
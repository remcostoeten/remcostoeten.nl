import { getSiteConfig } from '../config/site';
import type { 
  TNewProject, 
  TNewSkill, 
  TNewExperience, 
  TNewSiteSetting 
} from '../db/schema';

function createSampleProjects(): TNewProject[] {
  const config = getSiteConfig();
  
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    return [];
  }
  
  return [
    {
      title: "Sample Project 1",
      description: "A sample project for demonstration purposes. Replace this with your actual projects.",
      longDescription: "This is a placeholder project. You can replace this with your actual project data or remove it entirely when deploying to production.",
      url: `${config.site.url}/projects/sample-1`,
      githubUrl: `${config.social.github}/sample-project-1`,
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      category: "Web Application",
      featured: false,
      status: "completed",
      startDate: Date.parse("2024-01-01"),
      endDate: Date.parse("2024-03-01"),
      highlights: [
        "Modern tech stack",
        "Responsive design",
        "Clean code architecture"
      ],
      metrics: {
        stars: 0,
        forks: 0
      },
      isPublished: false,
      sortOrder: 999,
      slug: "sample-project-1"
    }
  ];
}

function createSampleSkills(): TNewSkill[] {
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    return [];
  }
  
  return [
    {
      name: "JavaScript",
      category: "Programming Languages",
      proficiency: 4,
      yearsOfExperience: 3,
      isActive: true,
      sortOrder: 1
    },
    {
      name: "React",
      category: "Frontend Frameworks",
      proficiency: 4,
      yearsOfExperience: 2,
      isActive: true,
      sortOrder: 2
    }
  ];
}

function createSampleExperience(): TNewExperience[] {
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    return [];
  }
  
  return [
    {
      title: "Software Developer",
      company: "Sample Company",
      location: "Remote",
      startDate: Date.parse("2023-01-01"),
      isCurrent: true,
      description: "Sample experience entry for demonstration purposes.",
      achievements: [
        "Sample achievement 1",
        "Sample achievement 2"
      ],
      technologies: ["JavaScript", "React"],
      sortOrder: 1
    }
  ];
}

function createSampleSiteSettings(): TNewSiteSetting[] {
  const config = getSiteConfig();
  
  return [
    {
      key: "site_title",
      value: config.site.title,
      type: "string",
      description: "Main site title",
      isPublic: true
    },
    {
      key: "site_description", 
      value: config.site.description,
      type: "string",
      description: "Site meta description",
      isPublic: true
    },
    {
      key: "contact_email",
      value: config.contact.email,
      type: "string", 
      description: "Primary contact email",
      isPublic: true
    },
    {
      key: "github_url",
      value: config.social.github,
      type: "string",
      description: "GitHub profile URL",
      isPublic: true
    },
    {
      key: "website_url",
      value: config.site.url,
      type: "string",
      description: "Main website URL",
      isPublic: true
    }
  ];
}

export const SampleDataFactory = {
  projects: createSampleProjects,
  skills: createSampleSkills,
  experience: createSampleExperience,
  siteSettings: createSampleSiteSettings
};

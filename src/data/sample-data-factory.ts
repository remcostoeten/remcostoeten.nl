import { getSiteConfig } from '../config/site-node';
import type { 
  TNewProject, 
  TNewSkill, 
  TNewExperience, 
  TNewSiteSetting 
} from '../db/schema';

function createSampleProjects(): TNewProject[] {
  return [];
}

function createSampleSkills(): TNewSkill[] {
  return [];
}

function createSampleExperience(): TNewExperience[] {
  return [];
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

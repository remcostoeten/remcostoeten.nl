import { TProjectData, TSimpleProject } from "../types";
import { getSiteConfig } from '../../config/site';

function getFeaturedProjects(): TProjectData[] {
  const config = getSiteConfig();
  
  // In development, return empty array to encourage using database or API
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔔 FEATURED_PROJECTS: Consider loading projects from database instead of hardcoded data');
  }
  
  // Return empty array to encourage database-driven approach
  return [];
}

function getSimpleProjects(): TSimpleProject[] {
  const config = getSiteConfig();
  
  // Allow configuration via environment variables
  if (process.env.NEXT_PUBLIC_SIMPLE_PROJECTS) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_SIMPLE_PROJECTS);
    } catch (error) {
      console.error('Error parsing NEXT_PUBLIC_SIMPLE_PROJECTS:', error);
    }
  }
  
  // Fallback to site URL if available
  if (config.site.url !== 'https://example.com') {
    return [
      { 
        name: config.site.title, 
        url: config.site.url 
      }
    ];
  }
  
  return [];
}

export const FEATURED_PROJECTS: TProjectData[] = getFeaturedProjects();
export const SIMPLE_PROJECTS: TSimpleProject[] = getSimpleProjects();

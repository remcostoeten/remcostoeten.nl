import { useQuery } from '@tanstack/react-query';
import { StaticCMSAdapter } from '../adapters/staticAdapter';
import { 
  HeroContent, 
  AboutContent, 
  ProjectContent, 
  ContactContent,
  SiteSettings,
  NavigationContent 
} from '../types/content';

// Static CMS hooks for development/fallback
export const useStaticHeroContent = () => {
  return useQuery({
    queryKey: ['static-cms-hero'],
    queryFn: StaticCMSAdapter.getHeroContent,
    staleTime: 10 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useStaticAboutContent = () => {
  return useQuery({
    queryKey: ['static-cms-about'],
    queryFn: StaticCMSAdapter.getAboutContent,
    staleTime: 10 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useStaticProjectsContent = (featured?: boolean) => {
  return useQuery({
    queryKey: ['static-cms-projects', { featured }],
    queryFn: () => StaticCMSAdapter.getProjects(featured),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.success ? data.data : [],
  });
};

export const useStaticContactContent = () => {
  return useQuery({
    queryKey: ['static-cms-contact'],
    queryFn: StaticCMSAdapter.getContactContent,
    staleTime: 10 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useStaticSiteSettings = () => {
  return useQuery({
    queryKey: ['static-cms-settings'],
    queryFn: StaticCMSAdapter.getSiteSettings,
    staleTime: 30 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useStaticNavigationContent = () => {
  return useQuery({
    queryKey: ['static-cms-navigation'],
    queryFn: StaticCMSAdapter.getNavigation,
    staleTime: 15 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CMSService } from '../services/cmsService';
import { 
  CMSContent, 
  ContentType, 
  HeroContent, 
  AboutContent, 
  ProjectContent, 
  ContactContent,
  SiteSettings,
  NavigationContent 
} from '../types/content';
import { CMSResponse, CMSQuery, CMSCreateRequest } from '../types/api';

// CMS Service instance (to be configured)
let cmsService: CMSService | null = null;

export const configureCMS = (baseUrl: string, apiKey: string) => {
  cmsService = new CMSService(baseUrl, apiKey);
};

export const useCMSService = () => {
  if (!cmsService) {
    throw new Error('CMS service not configured. Call configureCMS first.');
  }
  return cmsService;
};

// Generic content hook
export const useCMSContent = <T extends CMSContent>(
  query: CMSQuery,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-content', query],
    queryFn: () => service.getContent<T>(query),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    select: (data) => data.success ? data.data : undefined,
  });
};

// Content-specific hooks
export const useHeroContent = () => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-hero'],
    queryFn: () => service.getHeroContent(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useAboutContent = () => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-about'],
    queryFn: () => service.getAboutContent(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useProjectsContent = (featured?: boolean) => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-projects', { featured }],
    queryFn: () => service.getProjects(featured),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.success ? data.data : [],
  });
};

export const useContactContent = () => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-contact'],
    queryFn: () => service.getContactContent(),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useSiteSettings = () => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-settings'],
    queryFn: () => service.getSiteSettings(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    select: (data) => data.success ? data.data : undefined,
  });
};

export const useNavigationContent = () => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-navigation'],
    queryFn: () => service.getNavigation(),
    staleTime: 15 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

// Content by slug hook
export const useCMSContentBySlug = <T extends CMSContent>(
  slug: string, 
  type?: ContentType
) => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-content-slug', slug, type],
    queryFn: () => service.getContentBySlug<T>(slug, type),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.success ? data.data : undefined,
  });
};

// Mutation hooks for content management
export const useCMSCreateContent = () => {
  const service = useCMSService();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: CMSCreateRequest) => service.createContent(variables),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      queryClient.invalidateQueries({ queryKey: [`cms-${variables.type}`] });
    },
  });
};

export const useCMSUpdateContent = () => {
  const service = useCMSService();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      service.updateContent(id, data),
    onSuccess: () => {
      // Invalidate all CMS queries
      queryClient.invalidateQueries({ queryKey: ['cms-'] });
    },
  });
};

export const useCMSDeleteContent = () => {
  const service = useCMSService();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => service.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-'] });
    },
  });
};

// Media hooks
export const useCMSUploadMedia = () => {
  const service = useCMSService();
  
  return useMutation({
    mutationFn: service.uploadMedia.bind(service),
  });
};

export const useCMSMedia = (query?: { folder?: string; search?: string }) => {
  const service = useCMSService();
  
  return useQuery({
    queryKey: ['cms-media', query],
    queryFn: () => service.getMedia(query),
    staleTime: 2 * 60 * 1000,
    select: (data) => data.success ? data.data : [],
  });
};

// Cache management
export const useCMSCacheInvalidation = () => {
  const service = useCMSService();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (type?: ContentType) => service.invalidateCache(type),
    onSuccess: (_, type) => {
      if (type) {
        queryClient.invalidateQueries({ queryKey: [`cms-${type}`] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['cms-'] });
      }
    },
  });
};

// Preview mode hook
export const useCMSPreview = () => {
  const [previewMode, setPreviewMode] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const enablePreview = useCallback((token: string) => {
    setPreviewMode(true);
    setPreviewToken(token);
    // Store in sessionStorage for persistence
    sessionStorage.setItem('cms-preview-token', token);
  }, []);

  const disablePreview = useCallback(() => {
    setPreviewMode(false);
    setPreviewToken(null);
    sessionStorage.removeItem('cms-preview-token');
  }, []);

  useEffect(() => {
    // Check for preview token on mount
    const token = sessionStorage.getItem('cms-preview-token');
    if (token) {
      setPreviewMode(true);
      setPreviewToken(token);
    }
  }, []);

  return {
    previewMode,
    previewToken,
    enablePreview,
    disablePreview,
  };
};
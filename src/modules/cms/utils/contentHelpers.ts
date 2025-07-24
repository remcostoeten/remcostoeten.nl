import { ProjectContent, SocialLink } from '../types/content';

// Content transformation utilities
export const transformProjectsForDisplay = (projects: ProjectContent[]) => {
  return projects.map(project => ({
    ...project,
    data: {
      ...project.data,
      // Ensure required fields have defaults
      technologies: project.data.technologies || [],
      highlights: project.data.highlights || [],
      images: project.data.images || [],
    }
  }));
};

export const getFeaturedProjects = (projects: ProjectContent[]) => {
  return projects.filter(project => project.data.featured);
};

export const getProjectsByCategory = (projects: ProjectContent[], category: string) => {
  return projects.filter(project => 
    project.data.category.toLowerCase() === category.toLowerCase()
  );
};

export const sortProjectsByDate = (projects: ProjectContent[], order: 'asc' | 'desc' = 'desc') => {
  return [...projects].sort((a, b) => {
    const dateA = new Date(a.data.startDate).getTime();
    const dateB = new Date(b.data.startDate).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

// Social link utilities
export const getSocialLinkIcon = (platform: string): string => {
  const iconMap: Record<string, string> = {
    github: 'github',
    linkedin: 'linkedin',
    twitter: 'twitter',
    x: 'twitter',
    instagram: 'instagram',
    facebook: 'facebook',
    youtube: 'youtube',
    dribbble: 'dribbble',
    behance: 'behance',
    medium: 'medium',
    email: 'mail',
  };
  
  return iconMap[platform.toLowerCase()] || 'link';
};

export const formatSocialLink = (link: SocialLink) => {
  return {
    ...link,
    icon: link.icon || getSocialLinkIcon(link.platform),
    displayName: link.username || link.platform,
  };
};

// SEO utilities
export const generatePageTitle = (title: string, siteName?: string) => {
  if (!siteName) return title;
  return title === siteName ? title : `${title} | ${siteName}`;
};

export const truncateDescription = (description: string, maxLength: number = 160) => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

// Content validation utilities
export const validateProjectContent = (project: ProjectContent): string[] => {
  const errors: string[] = [];
  
  if (!project.data.title) errors.push('Title is required');
  if (!project.data.description) errors.push('Description is required');
  if (!project.data.startDate) errors.push('Start date is required');
  if (project.data.technologies.length === 0) errors.push('At least one technology is required');
  
  return errors;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date formatting utilities
export const formatProjectDate = (dateString: string, locale: string = 'en-US'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long'
  });
};

export const getProjectDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  
  if (months === 0) return '1 month';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  let duration = `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    duration += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
  
  return duration;
};

// Content filtering utilities
export const searchContent = <T extends { data: { title: string; description?: string } }>(
  items: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  
  return items.filter(item => 
    item.data.title.toLowerCase().includes(term) ||
    (item.data.description && item.data.description.toLowerCase().includes(term))
  );
};

// Rich text content utilities
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const extractExcerpt = (content: string, maxLength: number = 200): string => {
  const plainText = stripHtmlTags(content);
  return truncateDescription(plainText, maxLength);
};

// Image utilities
export const getOptimizedImageUrl = (
  url: string, 
  width?: number, 
  height?: number, 
  quality: number = 80
): string => {
  // This would integrate with your image optimization service
  // For now, return the original URL
  if (!width && !height) return url;
  
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  
  // Example: integrate with services like Cloudinary, ImageKit, etc.
  return `${url}?${params.toString()}`;
};

export const getImageAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};
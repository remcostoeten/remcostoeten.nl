import { 
  CMSContent, 
  ContentType, 
  HeroContent, 
  AboutContent, 
  ProjectContent, 
  ContactContent, 
  PageContent,
  SiteSettings,
  NavigationContent 
} from '../types/content';
import { 
  CMSResponse, 
  CMSQuery, 
  CMSCreateRequest, 
  CMSUpdateRequest,
  CMSMediaUpload,
  CMSMediaItem 
} from '../types/api';

export class CMSService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Generic CRUD operations
  async getContent<T extends CMSContent>(query: CMSQuery): Promise<CMSResponse<T[]>> {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${this.baseUrl}/content?${params}`, {
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getContentById<T extends CMSContent>(id: string): Promise<CMSResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/content/${id}`, {
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getContentBySlug<T extends CMSContent>(slug: string, type?: ContentType): Promise<CMSResponse<T>> {
    try {
      const params = new URLSearchParams({ slug });
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}/content/slug?${params}`, {
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async createContent<T extends CMSContent>(data: CMSCreateRequest): Promise<CMSResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/content`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async updateContent<T extends CMSContent>(id: string, data: CMSUpdateRequest): Promise<CMSResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/content/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async deleteContent(id: string): Promise<CMSResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/content/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Content-specific methods
  async getHeroContent(): Promise<CMSResponse<HeroContent>> {
    const response = await this.getContent<HeroContent>({ type: 'hero', status: 'published' });
    if (response.success && response.data && response.data.length > 0) {
      return { success: true, data: response.data[0] };
    }
    return { success: false, error: 'No hero content found' };
  }

  async getAboutContent(): Promise<CMSResponse<AboutContent>> {
    const response = await this.getContent<AboutContent>({ type: 'about', status: 'published' });
    if (response.success && response.data && response.data.length > 0) {
      return { success: true, data: response.data[0] };
    }
    return { success: false, error: 'No about content found' };
  }

  async getProjects(featured?: boolean): Promise<CMSResponse<ProjectContent[]>> {
    const query: CMSQuery = { type: 'project', status: 'published' };
    if (featured !== undefined) {
      query.filters = { featured };
    }
    return this.getContent<ProjectContent>(query);
  }

  async getContactContent(): Promise<CMSResponse<ContactContent>> {
    const response = await this.getContent<ContactContent>({ type: 'contact', status: 'published' });
    if (response.success && response.data && response.data.length > 0) {
      return { success: true, data: response.data[0] };
    }
    return { success: false, error: 'No contact content found' };
  }

  async getSiteSettings(): Promise<CMSResponse<SiteSettings>> {
    const response = await this.getContent<SiteSettings>({ type: 'settings', status: 'published' });
    if (response.success && response.data && response.data.length > 0) {
      return { success: true, data: response.data[0] };
    }
    return { success: false, error: 'No site settings found' };
  }

  async getNavigation(): Promise<CMSResponse<NavigationContent>> {
    const response = await this.getContent<NavigationContent>({ type: 'navigation', status: 'published' });
    if (response.success && response.data && response.data.length > 0) {
      return { success: true, data: response.data[0] };
    }
    return { success: false, error: 'No navigation content found' };
  }

  // Media operations
  async uploadMedia(upload: CMSMediaUpload): Promise<CMSResponse<CMSMediaItem>> {
    try {
      const formData = new FormData();
      formData.append('file', upload.file);
      if (upload.alt) formData.append('alt', upload.alt);
      if (upload.caption) formData.append('caption', upload.caption);
      if (upload.folder) formData.append('folder', upload.folder);

      const response = await fetch(`${this.baseUrl}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getMedia(query?: { folder?: string; search?: string }): Promise<CMSResponse<CMSMediaItem[]>> {
    try {
      const params = new URLSearchParams();
      if (query?.folder) params.append('folder', query.folder);
      if (query?.search) params.append('search', query.search);

      const response = await fetch(`${this.baseUrl}/media?${params}`, {
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Utility methods
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  // Cache invalidation
  async invalidateCache(type?: ContentType): Promise<CMSResponse<void>> {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await fetch(`${this.baseUrl}/cache/invalidate${params}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
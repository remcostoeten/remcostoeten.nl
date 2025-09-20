import type { 
  TBlogMetadata, 
  TBlogAnalytics, 
  TCreateBlogMetadataData, 
  TUpdateBlogMetadataData,
  TBlogMetadataFilters,
  TBlogMetadataWithAnalytics
} from '../types/blog-metadata';

export interface TBlogMetadataService {
  createMetadata(data: TCreateBlogMetadataData): Promise<TBlogMetadata>;
  getMetadataBySlug(slug: string): Promise<TBlogMetadata | null>;
  getAllMetadata(filters?: TBlogMetadataFilters): Promise<TBlogMetadata[]>;
  updateMetadata(slug: string, data: TUpdateBlogMetadataData): Promise<TBlogMetadata | null>;
  deleteMetadata(slug: string): Promise<boolean>;
  getMetadataWithAnalytics(slug: string): Promise<TBlogMetadataWithAnalytics | null>;
  getAllMetadataWithAnalytics(filters?: TBlogMetadataFilters): Promise<TBlogMetadataWithAnalytics[]>;
  incrementViewCount(slug: string): Promise<void>;
  getAnalyticsBySlug(slug: string): Promise<TBlogAnalytics | null>;
}

export function createMemoryBlogMetadataService(): TBlogMetadataService {
  // In-memory storage
  const metadataStore = new Map<string, TBlogMetadata>();
  const analyticsStore = new Map<string, TBlogAnalytics>();

  return {
    async createMetadata(data: TCreateBlogMetadataData): Promise<TBlogMetadata> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const metadata: TBlogMetadata = {
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      metadataStore.set(data.slug, metadata);

      // Create analytics record
      const analytics: TBlogAnalytics = {
        id: crypto.randomUUID(),
        slug: data.slug,
        totalViews: 0,
        uniqueViews: 0,
        recentViews: 0,
        createdAt: now,
        updatedAt: now,
      };

      analyticsStore.set(data.slug, analytics);

      return metadata;
    },

    async getMetadataBySlug(slug: string): Promise<TBlogMetadata | null> {
      return metadataStore.get(slug) || null;
    },

    async getAllMetadata(filters: TBlogMetadataFilters = {}): Promise<TBlogMetadata[]> {
      let posts = Array.from(metadataStore.values());

      if (filters.category) {
        posts = posts.filter(post => post.category === filters.category);
      }

      if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
      }

      if (filters.tags && filters.tags.length > 0) {
        posts = posts.filter(post => 
          filters.tags!.some(tag => post.tags.includes(tag))
        );
      }

      // Sort by published date (newest first)
      posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      if (filters.limit) {
        posts = posts.slice(0, filters.limit);
      }

      if (filters.offset) {
        posts = posts.slice(filters.offset);
      }

      return posts;
    },

    async updateMetadata(slug: string, data: TUpdateBlogMetadataData): Promise<TBlogMetadata | null> {
      const existing = metadataStore.get(slug);
      if (!existing) return null;

      const updated: TBlogMetadata = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      metadataStore.set(slug, updated);
      return updated;
    },

    async deleteMetadata(slug: string): Promise<boolean> {
      const deleted = metadataStore.delete(slug);
      analyticsStore.delete(slug);
      return deleted;
    },

    async getMetadataWithAnalytics(slug: string): Promise<TBlogMetadataWithAnalytics | null> {
      const metadata = metadataStore.get(slug);
      if (!metadata) return null;

      const analytics = analyticsStore.get(slug);

      return {
        ...metadata,
        analytics: analytics || undefined,
      };
    },

    async getAllMetadataWithAnalytics(filters: TBlogMetadataFilters = {}): Promise<TBlogMetadataWithAnalytics[]> {
      const metadata = await this.getAllMetadata(filters);
      
      return metadata.map(post => ({
        ...post,
        analytics: analyticsStore.get(post.slug) || undefined,
      }));
    },

    async incrementViewCount(slug: string): Promise<void> {
      const analytics = analyticsStore.get(slug);
      if (!analytics) return;

      const updated: TBlogAnalytics = {
        ...analytics,
        totalViews: analytics.totalViews + 1,
        lastViewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      analyticsStore.set(slug, updated);
    },

    async getAnalyticsBySlug(slug: string): Promise<TBlogAnalytics | null> {
      return analyticsStore.get(slug) || null;
    },
  };
}

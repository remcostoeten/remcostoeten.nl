import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db';
import { blogMetadata, blogAnalytics } from '../schema/blog-metadata';

// Check if database is available
const isDatabaseAvailable = () => {
  return db !== null;
};
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

export function createBlogMetadataService(): TBlogMetadataService {
  return {
    async createMetadata(data: TCreateBlogMetadataData): Promise<TBlogMetadata> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const [metadata] = await db.insert(blogMetadata).values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      }).returning();

      // Create analytics record
      await db.insert(blogAnalytics).values({
        id: crypto.randomUUID(),
        slug: data.slug,
        totalViews: 0,
        uniqueViews: 0,
        recentViews: 0,
        createdAt: now,
        updatedAt: now,
      });

      return metadata;
    },

    async getMetadataBySlug(slug: string): Promise<TBlogMetadata | null> {
      const [result] = await db
        .select()
        .from(blogMetadata)
        .where(eq(blogMetadata.slug, slug))
        .limit(1);
      
      return result || null;
    },

    async getAllMetadata(filters: TBlogMetadataFilters = {}): Promise<TBlogMetadata[]> {
      let query = db.select().from(blogMetadata);

      const conditions = [];

      if (filters.category) {
        conditions.push(eq(blogMetadata.category, filters.category));
      }

      if (filters.status) {
        conditions.push(eq(blogMetadata.status, filters.status));
      }

      if (filters.tags && filters.tags.length > 0) {
        conditions.push(sql`${blogMetadata.tags} && ${filters.tags}`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      query = query.orderBy(desc(blogMetadata.publishedAt));

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.offset(filters.offset);
      }

      return await query;
    },

    async updateMetadata(slug: string, data: TUpdateBlogMetadataData): Promise<TBlogMetadata | null> {
      const [result] = await db
        .update(blogMetadata)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(blogMetadata.slug, slug))
        .returning();

      return result || null;
    },

    async deleteMetadata(slug: string): Promise<boolean> {
      const [result] = await db
        .delete(blogMetadata)
        .where(eq(blogMetadata.slug, slug))
        .returning({ id: blogMetadata.id });

      // Also delete analytics
      await db
        .delete(blogAnalytics)
        .where(eq(blogAnalytics.slug, slug));

      return result !== undefined;
    },

    async getMetadataWithAnalytics(slug: string): Promise<TBlogMetadataWithAnalytics | null> {
      const [result] = await db
        .select({
          metadata: blogMetadata,
          analytics: blogAnalytics,
        })
        .from(blogMetadata)
        .leftJoin(blogAnalytics, eq(blogMetadata.slug, blogAnalytics.slug))
        .where(eq(blogMetadata.slug, slug))
        .limit(1);

      if (!result) return null;

      return {
        ...result.metadata,
        analytics: result.analytics || undefined,
      };
    },

    async getAllMetadataWithAnalytics(filters: TBlogMetadataFilters = {}): Promise<TBlogMetadataWithAnalytics[]> {
      let query = db
        .select({
          metadata: blogMetadata,
          analytics: blogAnalytics,
        })
        .from(blogMetadata)
        .leftJoin(blogAnalytics, eq(blogMetadata.slug, blogAnalytics.slug));

      const conditions = [];

      if (filters.category) {
        conditions.push(eq(blogMetadata.category, filters.category));
      }

      if (filters.status) {
        conditions.push(eq(blogMetadata.status, filters.status));
      }

      if (filters.tags && filters.tags.length > 0) {
        conditions.push(sql`${blogMetadata.tags} && ${filters.tags}`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      query = query.orderBy(desc(blogMetadata.publishedAt));

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.offset(filters.offset);
      }

      const results = await query;

      return results.map(result => ({
        ...result.metadata,
        analytics: result.analytics || undefined,
      }));
    },

    async incrementViewCount(slug: string): Promise<void> {
      const now = new Date().toISOString();
      
      await db
        .update(blogAnalytics)
        .set({
          totalViews: sql`${blogAnalytics.totalViews} + 1`,
          lastViewedAt: now,
          updatedAt: now,
        })
        .where(eq(blogAnalytics.slug, slug));
    },

    async getAnalyticsBySlug(slug: string): Promise<TBlogAnalytics | null> {
      const [result] = await db
        .select()
        .from(blogAnalytics)
        .where(eq(blogAnalytics.slug, slug))
        .limit(1);
      
      return result || null;
    },
  };
}

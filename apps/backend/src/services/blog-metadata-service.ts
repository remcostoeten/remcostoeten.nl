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
  incrementViewCount(
    slug: string,
    sessionData?: { sessionId?: string; ipAddress?: string; userAgent?: string; referrer?: string }
  ): Promise<boolean>;
  getAnalyticsBySlug(slug: string): Promise<TBlogAnalytics | null>;
}

export function createBlogMetadataService(): TBlogMetadataService {
  return {
    async createMetadata(data: TCreateBlogMetadataData): Promise<TBlogMetadata> {
      const id = crypto.randomUUID();
      const now = new Date();

      // Convert publishedAt string to Date object for database
      const publishedAtDate = new Date(data.publishedAt);

      const [metadata] = await db.insert(blogMetadata).values({
        id,
        ...data,
        publishedAt: publishedAtDate,
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
      // Convert publishedAt string to Date object if provided
      const updateData = { ...data };
      if (updateData.publishedAt) {
        updateData.publishedAt = new Date(updateData.publishedAt) as any;
      }

      const [result] = await db
        .update(blogMetadata)
        .set({
          ...updateData,
          updatedAt: new Date(),
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

      return results.map((result: { metadata: TBlogMetadata; analytics: TBlogAnalytics | null }) => ({
        ...result.metadata,
        analytics: result.analytics || undefined,
      }));
    },

    async incrementViewCount(slug: string, sessionData?: { sessionId?: string; ipAddress?: string; userAgent?: string; referrer?: string }): Promise<boolean> {
      const now = new Date();

      try {
        // First, ensure the analytics record exists
        const existingRecord = await db
          .select()
          .from(blogAnalytics)
          .where(eq(blogAnalytics.slug, slug))
          .limit(1);

        if (existingRecord.length === 0) {
          // Create new analytics record
          await db.insert(blogAnalytics).values({
            id: crypto.randomUUID(),
            slug,
            totalViews: 1,
            uniqueViews: 1,
            recentViews: 1,
            lastViewedAt: now,
            createdAt: now,
            updatedAt: now,
          });
        } else {
          // Update existing record
          await db
            .update(blogAnalytics)
            .set({
              totalViews: sql`${blogAnalytics.totalViews} + 1`,
              lastViewedAt: now,
              updatedAt: now,
            })
            .where(eq(blogAnalytics.slug, slug));
        }

        // If session data is provided, try to record a unique view
        if (sessionData?.sessionId) {
          // Import blog views schema
          const { blogSessionViews } = await import('../schema');

          // Insert unique view and ignore duplicates without throwing
          await db
            .insert(blogSessionViews)
            .values({
              id: crypto.randomUUID(),
              slug,
              sessionId: sessionData.sessionId,
              ipAddress: sessionData.ipAddress,
              userAgent: sessionData.userAgent,
              referrer: sessionData.referrer,
              timestamp: now,
              createdAt: now,
            })
            .onConflictDoNothing({ target: [blogSessionViews.sessionId, blogSessionViews.slug] });
        }

        return true; // View was incremented
      } catch (error) {
        console.error('Error incrementing view count:', error);
        throw error;
      }
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

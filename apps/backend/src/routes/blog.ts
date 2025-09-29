import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { TBlogMetadataService } from '../services/blog-metadata-service';

export const createBlogRouter = (blogService: TBlogMetadataService) => {
  const blogRouter = new Hono();

  // Validation schemas
  const blogMetadataSchema = z.object({
    slug: z.string().min(1, 'Slug is required'),
    title: z.string().min(1, 'Title is required'),
    excerpt: z.string().min(1, 'Excerpt is required'),
    publishedAt: z.string().datetime('Invalid date format'),
    readTime: z.number().min(1, 'Read time must be at least 1 minute'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['development', 'design', 'best-practices']),
    status: z.enum(['published', 'draft']).default('published'),
    author: z.string().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }).optional(),
  });

  const updateBlogMetadataSchema = blogMetadataSchema.partial();

  const querySchema = z.object({
    category: z.enum(['development', 'design', 'best-practices']).optional(),
    status: z.enum(['published', 'draft']).optional(),
    tags: z.string().optional(), // comma-separated tags
    limit: z.string().transform(Number).optional(),
    offset: z.string().transform(Number).optional(),
  });

  const slugParamSchema = z.object({
    slug: z.string().min(1, 'Slug parameter is required'),
  });

  // POST /api/blog/metadata - Create blog metadata
  blogRouter.post(
    '/metadata',
    zValidator('json', blogMetadataSchema),
    async (c) => {
      try {
        const metadataData = c.req.valid('json');
        const metadata = await blogService.createMetadata(metadataData);
        
        return c.json({
          success: true,
          data: metadata,
          message: 'Blog metadata created successfully'
        }, 201);
      } catch (error) {
        console.error('Error creating blog metadata:', error);
        return c.json({
          success: false,
          message: 'Failed to create blog metadata'
        }, 500);
      }
    }
  );

  // GET /api/blog/metadata - Get all blog metadata
  blogRouter.get(
    '/metadata',
    zValidator('query', querySchema),
    async (c) => {
      try {
        const query = c.req.valid('query');
        const filters = {
          category: query.category,
          status: query.status,
          tags: query.tags ? query.tags.split(',').filter(Boolean) : undefined,
          limit: query.limit,
          offset: query.offset,
        };

        const metadata = await blogService.getAllMetadataWithAnalytics(filters);
        
        return c.json({
          success: true,
          data: metadata
        });
      } catch (error) {
        console.error('Error fetching blog metadata:', error);
        return c.json({
          success: false,
          message: 'Failed to fetch blog metadata'
        }, 500);
      }
    }
  );

  // GET /api/blog/metadata/:slug - Get blog metadata by slug
  blogRouter.get(
    '/metadata/:slug',
    zValidator('param', slugParamSchema),
    async (c) => {
      try {
        const { slug } = c.req.valid('param');
        const metadata = await blogService.getMetadataWithAnalytics(slug);
        
        if (!metadata) {
          return c.json({
            success: false,
            message: 'Blog post not found'
          }, 404);
        }
        
        return c.json({
          success: true,
          data: metadata
        });
      } catch (error) {
        console.error('Error fetching blog metadata:', error);
        return c.json({
          success: false,
          message: 'Failed to fetch blog metadata'
        }, 500);
      }
    }
  );

  // PUT /api/blog/metadata/:slug - Update blog metadata
  blogRouter.put(
    '/metadata/:slug',
    zValidator('param', slugParamSchema),
    zValidator('json', updateBlogMetadataSchema),
    async (c) => {
      try {
        const { slug } = c.req.valid('param');
        const updateData = c.req.valid('json');
        
        const metadata = await blogService.updateMetadata(slug, updateData);
        
        if (!metadata) {
          return c.json({
            success: false,
            message: 'Blog post not found'
          }, 404);
        }
        
        return c.json({
          success: true,
          data: metadata,
          message: 'Blog metadata updated successfully'
        });
      } catch (error) {
        console.error('Error updating blog metadata:', error);
        return c.json({
          success: false,
          message: 'Failed to update blog metadata'
        }, 500);
      }
    }
  );

  // DELETE /api/blog/metadata/:slug - Delete blog metadata
  blogRouter.delete(
    '/metadata/:slug',
    zValidator('param', slugParamSchema),
    async (c) => {
      try {
        const { slug } = c.req.valid('param');
        const deleted = await blogService.deleteMetadata(slug);
        
        if (!deleted) {
          return c.json({
            success: false,
            message: 'Blog post not found'
          }, 404);
        }
        
        return c.json({
          success: true,
          message: 'Blog metadata deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting blog metadata:', error);
        return c.json({
          success: false,
          message: 'Failed to delete blog metadata'
        }, 500);
      }
    }
  );

  // POST /api/blog/analytics/:slug/view - Increment view count
  blogRouter.post(
    '/analytics/:slug/view',
    zValidator('param', slugParamSchema),
    async (c) => {
      try {
        const { slug } = c.req.valid('param');
        await blogService.incrementViewCount(slug);
        
        return c.json({
          success: true,
          message: 'View count incremented'
        });
      } catch (error) {
        console.error('Error incrementing view count:', error);
        return c.json({
          success: false,
          message: 'Failed to increment view count'
        }, 500);
      }
    }
  );

  // GET /api/blog/analytics/:slug - Get blog analytics
  blogRouter.get(
    '/analytics/:slug',
    zValidator('param', slugParamSchema),
    async (c) => {
      try {
        const { slug } = c.req.valid('param');
        const analytics = await blogService.getAnalyticsBySlug(slug);
        
        if (!analytics) {
          return c.json({
            success: false,
            message: 'Blog analytics not found'
          }, 404);
        }
        
        return c.json({
          success: true,
          data: analytics
        });
      } catch (error) {
        console.error('Error fetching blog analytics:', error);
        return c.json({
          success: false,
          message: 'Failed to fetch blog analytics'
        }, 500);
      }
    }
  );

  return blogRouter;
};

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { TBlogMetadataService } from '../services/blog-metadata-service';
import { TBlogFeedbackService } from '../services/blog-feedback-service';

export const createBlogRouter = (
  blogService: TBlogMetadataService,
  feedbackService?: TBlogFeedbackService
) => {
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

  // POST /api/blog/analytics/multiple - Get multiple blog analytics
  blogRouter.post(
    '/analytics/multiple',
    zValidator('json', z.object({
      slugs: z.array(z.string().min(1))
    })),
    async (c) => {
      try {
        const { slugs } = c.req.valid('json');
        
        if (slugs.length === 0) {
          return c.json({
            success: true,
            data: []
          });
        }

        // Get analytics for each slug
        const analyticsPromises = slugs.map(async (slug) => {
          try {
            const analytics = await blogService.getAnalyticsBySlug(slug);
            return {
              slug,
              totalViews: analytics?.viewCount || 0,
              uniqueViews: analytics?.uniqueViews || 0
            };
          } catch (error) {
            console.error(`Error fetching analytics for ${slug}:`, error);
            return {
              slug,
              totalViews: 0,
              uniqueViews: 0
            };
          }
        });

        const results = await Promise.all(analyticsPromises);
        
        return c.json({
          success: true,
          data: results
        });
      } catch (error) {
        console.error('Error fetching multiple blog analytics:', error);
        return c.json({
          success: false,
          message: 'Failed to fetch multiple blog analytics'
        }, 500);
      }
    }
  );

  // Feedback endpoints - only if service is provided
  if (feedbackService) {
    // Validation schema for feedback submission
    const feedbackSchema = z.object({
      emoji: z.string().min(1, 'Emoji is required').max(10),
      message: z.string().optional(),
      url: z.string().optional(),
      userAgent: z.string().optional(),
    });

    // POST /api/blog/feedback/:slug - Submit feedback
    blogRouter.post(
      '/feedback/:slug',
      zValidator('param', slugParamSchema),
      zValidator('json', feedbackSchema),
      async (c) => {
        try {
          const { slug } = c.req.valid('param');
          const feedbackData = c.req.valid('json');
          const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip');
          
          const feedback = await feedbackService.submitFeedback(
            slug,
            feedbackData,
            ip
          );
          
          return c.json({
            success: true,
            data: feedback,
            message: 'Feedback submitted successfully'
          }, 201);
        } catch (error) {
          console.error('Error submitting feedback:', error);
          return c.json({
            success: false,
            message: 'Failed to submit feedback'
          }, 500);
        }
      }
    );

    // GET /api/blog/feedback/:slug - Get feedback stats
    blogRouter.get(
      '/feedback/:slug',
      zValidator('param', slugParamSchema),
      async (c) => {
        try {
          const { slug } = c.req.valid('param');
          const stats = await feedbackService.getFeedbackBySlug(slug);
          
          return c.json({
            success: true,
            data: stats
          });
        } catch (error) {
          console.error('Error fetching feedback stats:', error);
          return c.json({
            success: false,
            message: 'Failed to fetch feedback stats'
          }, 500);
        }
      }
    );

    // GET /api/blog/feedback/:slug/reactions - Get feedback reactions
    blogRouter.get(
      '/feedback/:slug/reactions',
      zValidator('param', slugParamSchema),
      async (c) => {
        try {
          const { slug } = c.req.valid('param');
          const reactions = await feedbackService.getFeedbackReactions(slug);
          
          return c.json({
            success: true,
            data: reactions
          });
        } catch (error) {
          console.error('Error fetching feedback reactions:', error);
          return c.json({
            success: false,
            message: 'Failed to fetch feedback reactions'
          }, 500);
        }
      }
    );

    // GET /api/blog/feedback/:slug/user - Get user's feedback
    blogRouter.get(
      '/feedback/:slug/user',
      zValidator('param', slugParamSchema),
      async (c) => {
        try {
          const { slug } = c.req.valid('param');
          const fingerprint = c.req.query('fingerprint');
          
          if (!fingerprint) {
            return c.json({
              success: false,
              message: 'Fingerprint is required'
            }, 400);
          }
          
          const userFeedback = await feedbackService.getUserFeedback(
            slug,
            fingerprint
          );
          
          return c.json({
            success: true,
            data: userFeedback,
            hasSubmitted: !!userFeedback
          });
        } catch (error) {
          console.error('Error fetching user feedback:', error);
          return c.json({
            success: false,
            message: 'Failed to fetch user feedback'
          }, 500);
        }
      }
    );
  }

  return blogRouter;
};

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createPageviewService, PageviewService } from '../services/pageviewService';

export const createPageviewsRouter = (pageviewService: PageviewService) => {
  const pageviewsRouter = new Hono();

// Validation schemas
const pageviewSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

const querySchema = z.object({
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  url: z.string().optional(),
});

// POST /api/pageviews - Track a pageview
pageviewsRouter.post(
  '/pageviews',
  zValidator('json', pageviewSchema),
  async (c) => {
    try {
      const pageviewData = c.req.valid('json');
      
      // Add timestamp if not provided
      if (!pageviewData.timestamp) {
        pageviewData.timestamp = new Date().toISOString();
      }

      const pageview = await pageviewService.createPageview(pageviewData);
      
      return c.json({
        success: true,
        data: pageview,
        message: 'Pageview tracked successfully'
      }, 201);
    } catch (error) {
      console.error('Error creating pageview:', error);
      return c.json({
        success: false,
        message: 'Failed to track pageview'
      }, 500);
    }
  }
);

// GET /api/pageviews - Get pageviews with optional filtering
pageviewsRouter.get(
  '/pageviews',
  zValidator('query', querySchema),
  async (c) => {
    try {
      const { limit = 50, offset = 0, url } = c.req.valid('query');
      
      const pageviews = await pageviewService.getPageviews({
        limit,
        offset,
        url
      });
      
      const total = await pageviewService.getTotalCount({ url });
      
      return c.json({
        success: true,
        data: {
          pageviews,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching pageviews:', error);
      return c.json({
        success: false,
        message: 'Failed to fetch pageviews'
      }, 500);
    }
  }
);

// GET /api/pageviews/stats - Get pageview statistics
pageviewsRouter.get('/pageviews/stats', async (c) => {
  try {
    const stats = await pageviewService.getStats();
    
    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({
      success: false,
      message: 'Failed to fetch statistics'
    }, 500);
  }
});

  return pageviewsRouter;
};

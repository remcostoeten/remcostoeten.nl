import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createHybridVisitorService } from '../services/hybrid-visitor-service';
import { generateVisitorFingerprint, extractFingerprintFromRequest } from '../utils/visitor-fingerprint';
import type { CreateVisitorData, CreateBlogViewData } from '../types/visitor';

// Initialize visitor service
const visitorService = createHybridVisitorService();

const visitorRouter = new Hono();

// Validation schemas
const blogViewSchema = z.object({
  blogSlug: z.string().min(1, 'Blog slug is required'),
  blogTitle: z.string().min(1, 'Blog title is required'),
});

const slugParamSchema = z.object({
  slug: z.string().min(1, 'Slug parameter is required'),
});

const visitorIdParamSchema = z.object({
  visitorId: z.string().min(1, 'Visitor ID parameter is required'),
});

// Track a visitor
visitorRouter.post('/track-visitor', async (c) => {
  try {
    const fingerprintData = extractFingerprintFromRequest(c.req.raw);
    const visitorId = generateVisitorFingerprint(fingerprintData);
    
    const visitorData: CreateVisitorData = {
      visitorId,
      userAgent: fingerprintData.userAgent,
      ipAddress: fingerprintData.ipAddress,
    };

    const visitor = await visitorService.trackVisitor(visitorData);
    
    return c.json({
      success: true,
      visitorId,
      visitor,
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return c.json({
      success: false,
      error: 'Failed to track visitor',
    }, 500);
  }
});

// Track a blog view
visitorRouter.post('/track-blog-view', zValidator('json', blogViewSchema), async (c) => {
  try {
    const { blogSlug, blogTitle } = c.req.valid('json');

    const fingerprintData = extractFingerprintFromRequest(c.req.raw);
    const visitorId = generateVisitorFingerprint(fingerprintData);
    
    const blogViewData: CreateBlogViewData = {
      visitorId,
      blogSlug,
      blogTitle,
    };

    // Track visitor first
    const visitorData: CreateVisitorData = {
      visitorId,
      userAgent: fingerprintData.userAgent,
      ipAddress: fingerprintData.ipAddress,
    };

    const visitor = await visitorService.trackVisitor(visitorData);
    const blogView = await visitorService.trackBlogView(blogViewData);
    
    return c.json({
      success: true,
      visitorId,
      visitor,
      blogView,
    });
  } catch (error) {
    console.error('Error tracking blog view:', error);
    return c.json({
      success: false,
      error: 'Failed to track blog view',
    }, 500);
  }
});

// Get visitor stats
visitorRouter.get('/stats', async (c) => {
  try {
    const stats = await visitorService.getVisitorStats();
    
    return c.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return c.json({
      success: false,
      error: 'Failed to get visitor stats',
    }, 500);
  }
});

// Get blog view count
visitorRouter.get('/blog/:slug/views', zValidator('param', slugParamSchema), async (c) => {
  try {
    const { slug } = c.req.valid('param');
    
    const viewCount = await visitorService.getBlogViewCount(slug);
    
    return c.json({
      success: true,
      blogSlug: slug,
      viewCount,
    });
  } catch (error) {
    console.error('Error getting blog view count:', error);
    return c.json({
      success: false,
      error: 'Failed to get blog view count',
    }, 500);
  }
});

// Get visitor by ID
visitorRouter.get('/visitor/:visitorId', zValidator('param', visitorIdParamSchema), async (c) => {
  try {
    const { visitorId } = c.req.valid('param');
    
    const visitor = await visitorService.getVisitor(visitorId);
    
    return c.json({
      success: true,
      visitorId,
      visitor,
    });
  } catch (error) {
    console.error('Error getting visitor:', error);
    return c.json({
      success: false,
      error: 'Failed to get visitor',
    }, 500);
  }
});

export { visitorRouter };
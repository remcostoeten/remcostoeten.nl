import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { visitorRouter } from './routes/visitors';
import { createPageviewsRouter } from './routes/pageviews';
import { createBlogRouter } from './routes/blog';
import { spotifyRouter } from './routes/spotify';
import { createAnalyticsRouter } from './routes/analytics';
import { createContactRouter } from './routes/contact';
import { createPageviewService } from './services/pageviewService';
import { createHybridPageviewService } from './services/hybrid-pageview-service';
import { createBlogMetadataService } from './services/blog-metadata-service';
import { createMemoryBlogMetadataService } from './services/memory-blog-metadata-service';
import { createBlogFeedbackService } from './services/blog-feedback-service';
import { createContactMessagesService } from './services/contact-messages-service';

import { db } from './db';
import { initializeDatabase } from './db';

export const createApp = async () => {
  const app = new Hono();

  // Initialize database (optional - will fallback to memory if fails)
  try {
    await initializeDatabase();
  } catch (error) {
    console.warn('Database initialization failed, using memory storage:', error);
  }

  // Initialize services with hybrid approach
  const hybridPageviewService = createHybridPageviewService();
  const pageviewService = createPageviewService(hybridPageviewService);

  // Use database service if available, otherwise use memory service
  const blogMetadataService = db ? createBlogMetadataService() : createMemoryBlogMetadataService();

  // Initialize feedback service (only with database)
  const blogFeedbackService = db ? createBlogFeedbackService(db) : undefined;

  // Initialize contact messages service (only with database)
  const contactMessagesService = db ? createContactMessagesService(db) : undefined;

  // Middleware
  app.use('*', logger());

  // Configure CORS for both development and production
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:4001'];

  app.use('*', cors({
    origin: (origin, c) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return '*';

      // Check if the origin is in our allowed list
      if (corsOrigins.some(allowed =>
        allowed === '*' ||
        origin === allowed ||
        (allowed.includes('*') && new RegExp(allowed.replace('*', '.*')).test(origin))
      )) {
        return origin;
      }

      // Default to allowing localhost in development
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return origin;
      }

      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Screen-Resolution', 'X-Timezone', 'X-Platform'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
    credentials: true,
  }));

  // Health check
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      storage: 'hybrid'
    });
  });

  // Routes
  app.route('/api/visitors', visitorRouter);
  app.route('/api/pageviews', createPageviewsRouter(pageviewService));
  app.route('/api/blog', createBlogRouter(blogMetadataService, blogFeedbackService));
  app.route('/api/spotify', spotifyRouter);
  app.route('/api/analytics', createAnalyticsRouter());

  if (contactMessagesService) {
    app.route('/api/contact', createContactRouter(contactMessagesService));
  }

  // Serve the beautiful API documentation page
  app.get('/', async (c) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const htmlPath = path.join(process.cwd(), 'src', 'api-docs.html');
      const html = await fs.readFile(htmlPath, 'utf-8');
      return c.html(html);
    } catch (error) {
      console.error('Error loading API docs:', error);
      // Fallback to simple list if file not found
      const routes = app.routes.map((route) => {
        return `<li><a href="${route.path}">${route.method} ${route.path}</a></li>`;
      });

      return c.html(`<html>
        <head>
          <title>API Endpoints</title>
        </head>
        <body>
          <h1>Available Endpoints</h1>
          <ul>
            ${routes.join('')}
          </ul>
        </body>
      </html>`);
    }
  });

  return app;
};

const port = process.env.PORT || 4001;

// Initialize and start the server
let appInstance: any = null;

export default {
  port,
  fetch: async (request: Request) => {
    if (!appInstance) {
      appInstance = await createApp();
    }
    return appInstance.fetch(request);
  },
};

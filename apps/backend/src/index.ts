import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { visitorRouter } from './routes/visitors';
import { createPageviewsRouter } from './routes/pageviews';
import { createBlogRouter } from './routes/blog';
import { createPageviewService } from './services/pageviewService';
import { createHybridPageviewService } from './services/hybrid-pageview-service';
import { createBlogMetadataService } from './services/blog-metadata-service';
import { createMemoryBlogMetadataService } from './services/memory-blog-metadata-service';
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

  // Middleware
  app.use('*', logger());
  app.use('*', cors({
    origin: ['http://localhost:3000', 'http://localhost:4001'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Screen-Resolution', 'X-Timezone', 'X-Platform'],
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
  app.route('/api/blog', createBlogRouter(blogMetadataService));

  // Index page with all available endpoints
  let cachedRoutesHtml: string | null = null;
  
  app.get('/', (c) => {
    if (!cachedRoutesHtml) {
      const routes = app.routes.map((route) => {
        return `<li><a href="${route.path}">${route.method} ${route.path}</a></li>`;
      });
      
      cachedRoutesHtml = `<html>
        <head>
          <title>Hono App Endpoints</title>
        </head>
        <body>
          <h1>Available Endpoints</h1>
          <ul>
            ${routes.join('')}
          </ul>
        </body>
      </html>`;
    }

    return c.html(cachedRoutesHtml);
  });

  return app;
};

const port = process.env.PORT || 4001;

// Initialize and start the server
let appInstance: any = null;

createApp().then((app) => {
  appInstance = app;
  console.log(`🚀 Server running on http://localhost:${port}`);
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default {
  port,
  fetch: (request: Request) => {
    if (!appInstance) {
      throw new Error('Server not initialized yet');
    }
    return appInstance.fetch(request);
  },
};

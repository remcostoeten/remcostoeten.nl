import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { visitorRouter } from './routes/visitors';

type StorageType = 'memory' | 'sqlite';

export const createApp = () => {
  const app = new Hono();

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
      storage: storageType,
      dbPath: dbPath || 'N/A'
    });
  });

  // Routes
  app.route('/api/visitors', visitorRouter);

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
const app = createApp();

console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};

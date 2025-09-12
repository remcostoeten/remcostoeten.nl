import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createPageviewsRouter } from './routes/pageviews';
import { createPageviewService } from './services/pageviewService';
import { createStorage } from './storage';
import type { StorageType } from './storage';

export const createApp = (storageType: StorageType = 'memory', dbPath?: string) => {
  const app = new Hono();

  // Initialize storage and services
  const storage = createStorage(storageType, dbPath);
  const pageviewService = createPageviewService(storage);

  // Middleware
  app.use('*', logger());
  app.use('*', cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
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
  app.route('/api', createPageviewsRouter(pageviewService));

  return app;
};

// Default app instance
const storageType = (process.env.STORAGE_TYPE as StorageType) || 'memory';
const dbPath = process.env.DB_PATH;
const app = createApp(storageType, dbPath);

const port = process.env.PORT || 3001;

console.log(`🚀 Server running on http://localhost:${port}`);
console.log(`📊 Storage: ${storageType}${dbPath ? ` (${dbPath})` : ''}`);

export default {
  port,
  fetch: app.fetch,
};

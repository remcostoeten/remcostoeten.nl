import { serve } from '@hono/node-server';
import { app } from '../api/index';

const port = 3001;

console.log(`🚀 Analytics API server running on http://localhost:${port}`);
console.log('📊 Available endpoints:');
console.log('  POST /api/analytics/events');
console.log('  GET  /api/analytics/metrics');
console.log('  GET  /api/analytics/realtime');
console.log('  GET  /api/analytics/events');
console.log('  GET  /api/health');

serve({
  fetch: app.fetch,
  port,
});

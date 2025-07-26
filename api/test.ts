import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono();

app.get('/test', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Hono API is working!',
    timestamp: new Date().toISOString() 
  });
});

export default handle(app);

# Backend Deployment Documentation

## 🚀 Production URL
**Base URL:** https://analytics-api-backend.fly.dev

## 📍 API Endpoints

### Health Check
- **GET** `/health` - Check API status
- **GET** `/` - Interactive API documentation page

### Visitor Tracking
- **POST** `/api/visitors/track-visitor` - Track a new visitor
- **POST** `/api/visitors/track-blog-view` - Track blog view with visitor
- **GET** `/api/visitors/stats` - Get visitor statistics
- **GET** `/api/visitors/blog/:slug/views` - Get blog view count
- **GET** `/api/visitors/visitor/:visitorId` - Get visitor details

### Pageviews
- **POST** `/api/pageviews` - Track a pageview
- **GET** `/api/pageviews` - Get pageviews with filtering
- **GET** `/api/pageviews/stats` - Get pageview statistics

### Blog Management
- **POST** `/api/blog/metadata` - Create blog metadata
- **GET** `/api/blog/metadata` - Get all blog metadata
- **GET** `/api/blog/metadata/:slug` - Get specific blog metadata
- **PUT** `/api/blog/metadata/:slug` - Update blog metadata
- **DELETE** `/api/blog/metadata/:slug` - Delete blog metadata
- **POST** `/api/blog/analytics/:slug/view` - Increment view count
- **GET** `/api/blog/analytics/:slug` - Get blog analytics

### Blog View Tracking
- **POST** `/api/blog/views` - Record blog view with session
- **GET** `/api/blog/views/:slug` - Get view count for post
- **POST** `/api/blog/views/multiple` - Get multiple view counts
- **GET** `/api/blog/views` - Get blog views with filtering
- **GET** `/api/blog/views/stats` - Get blog view statistics
- **DELETE** `/api/blog/views/cleanup` - Clean up old views

## 🔧 Configuration

### Environment Variables
The following environment variables are configured on Fly.io:

```bash
DATABASE_URL       # Neon PostgreSQL connection string
STORAGE_TYPE       # Set to "postgres" for database storage
CORS_ORIGINS       # Allowed origins for CORS
NODE_ENV          # Set to "production"
PORT              # Set to 4001
```

### CORS Configuration
The API accepts requests from:
- `https://analytics-api-backend.fly.dev` (self)
- `https://*.vercel.app` (any Vercel deployment)
- `http://localhost:3000` (local development)
- `http://localhost:3001` (local development)

To add more origins, update the `CORS_ORIGINS` environment variable:
```bash
flyctl secrets set CORS_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
```

## 📦 Frontend Integration

### Example: Track a Pageview
```javascript
const trackPageview = async () => {
  const response = await fetch('https://analytics-api-backend.fly.dev/api/pageviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  });
  
  const data = await response.json();
  console.log('Pageview tracked:', data);
};
```

### Example: Track Blog View
```javascript
const trackBlogView = async (slug, title) => {
  const response = await fetch('https://analytics-api-backend.fly.dev/api/visitors/track-blog-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blogSlug: slug,
      blogTitle: title
    })
  });
  
  const data = await response.json();
  console.log('Blog view tracked:', data);
};
```

### Example: Get Blog View Count
```javascript
const getViewCount = async (slug) => {
  const response = await fetch(`https://analytics-api-backend.fly.dev/api/blog/views/${slug}`);
  const data = await response.json();
  
  if (data.success) {
    console.log(`Total views: ${data.data.totalViews}`);
    console.log(`Unique views: ${data.data.uniqueViews}`);
  }
};
```

## 🔄 Deployment Updates

### Deploy New Changes
```bash
cd apps/backend
flyctl deploy
```

### View Logs
```bash
flyctl logs
```

### SSH into Container
```bash
flyctl ssh console
```

### Update Secrets
```bash
flyctl secrets set KEY="value"
```

### Scale Application
```bash
# Scale to 3 instances
flyctl scale count 3

# Scale machine size
flyctl scale vm shared-cpu-2x
```

## 📊 Monitoring

### View Dashboard
Visit: https://fly.io/apps/analytics-api-backend/monitoring

### Check Status
```bash
flyctl status
```

### View Metrics
```bash
flyctl monitor
```

## 🔒 Security Notes

1. **Database URL**: Keep the DATABASE_URL secret and never commit it to version control
2. **CORS**: Only add trusted domains to CORS_ORIGINS
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **Authentication**: Add authentication for sensitive endpoints if needed

## 🐛 Troubleshooting

### Check Health
```bash
curl https://analytics-api-backend.fly.dev/health
```

### View Recent Logs
```bash
flyctl logs --tail 50
```

### Restart Application
```bash
flyctl apps restart
```

### Check Secrets
```bash
flyctl secrets list
```

## 📝 Notes

- The API uses hybrid storage (PostgreSQL + Memory) for optimal performance
- Health checks run every 30 seconds on `/health` endpoint
- The application auto-scales between 2-10 instances based on load
- SSL/TLS is automatically handled by Fly.io
- The API documentation page is available at the root URL

## 🔗 Related Resources

- [Fly.io Dashboard](https://fly.io/apps/analytics-api-backend)
- [API Documentation](https://analytics-api-backend.fly.dev/)
- [Neon Database Console](https://console.neon.tech/)
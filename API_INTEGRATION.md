# API Integration Documentation

## 🚀 Overview

The frontend is now fully integrated with both local and production API endpoints. You can easily switch between environments for development and testing.

## 🌐 API Endpoints

- **Local API**: `http://localhost:4001`
- **Production API**: `https://analytics-api-backend.fly.dev`

## 🔄 Environment Switching

### Method 1: Environment Switcher UI (Development Only)
- Look for the **API Environment Switcher** in the bottom-right corner
- Toggle between "Local" and "Production"
- Page will reload to apply changes

### Method 2: URL Parameter
Add `?api=production` or `?api=local` to any page URL:
```
http://localhost:3000/blog?api=production
http://localhost:3000/api-test?api=local
```

### Method 3: Environment Variables
Set in your `.env.local` file:
```bash
# For local development
NEXT_PUBLIC_API_ENV=local

# For production builds
NEXT_PUBLIC_API_ENV=production
```

### Method 4: localStorage (Programmatic)
```javascript
// Switch to production
localStorage.setItem('apiEnvironment', 'production');
window.location.reload();

// Switch to local
localStorage.setItem('apiEnvironment', 'local');
window.location.reload();

// Clear override (use default)
localStorage.removeItem('apiEnvironment');
window.location.reload();
```

## 📍 Visual Indicators

### Environment Switcher (Bottom Right)
- **Development only** - Shows current environment with toggle options
- Green dot = Production API
- Yellow dot = Local API

### Environment Indicator (Bottom Left)
- **Always visible** - Shows current API environment
- Pulsing green = Production
- Pulsing yellow = Local

## 🧪 Testing the Integration

### Test Page
Visit `/api-test` to test the API integration:
```
http://localhost:3000/api-test
```

This page provides:
- Current configuration display
- Health check endpoint test
- Visitor statistics test
- Visitor tracking test
- Real-time results display

## 💻 Using the API in Code

### Import the Configuration
```typescript
import { API, apiFetch, getApiConfig } from '@/config/api.config';
```

### Example: Track a Visitor
```typescript
const result = await apiFetch(API.visitors.track(), {
  method: 'POST',
  body: JSON.stringify({
    visitorId: 'unique-id',
    userAgent: navigator.userAgent,
  }),
});

if (result.success) {
  console.log('Visitor tracked:', result.data);
} else {
  console.error('Failed to track:', result.error);
}
```

### Example: Get Blog View Count
```typescript
const result = await apiFetch(API.blog.views.get('my-blog-post'));

if (result.success) {
  console.log('View count:', result.data.totalViews);
}
```

### Example: Check Current Environment
```typescript
const config = getApiConfig();
console.log('Using API:', config.environment); // 'local' or 'production'
console.log('Base URL:', config.base);
```

## 📦 Updated Services

The following services have been updated to use the new API configuration:
- `useVisitorTracking` hook
- `ViewsService` class
- All blog analytics components

## 🔧 Configuration Files

### `/src/config/api.config.ts`
Central API configuration with:
- Environment detection logic
- Endpoint builders
- Type-safe fetch wrapper

### `/src/components/api-environment-switcher.tsx`
UI components for:
- Environment switcher (development)
- Environment indicator (all environments)

### Environment Files
- `.env.local` - Local development settings
- `.env.production` - Production build settings
- `.env.example` - Example configuration

## 🚨 Important Notes

1. **CORS is configured** - The production API accepts requests from:
   - `https://*.vercel.app`
   - `http://localhost:3000`
   - `http://localhost:3001`

2. **Default Behavior**:
   - Development builds → Local API
   - Production builds → Production API
   - Can be overridden using methods above

3. **API Health Check**:
   - Local: http://localhost:4001/health
   - Production: https://analytics-api-backend.fly.dev/health

## 🐛 Troubleshooting

### API Not Responding
1. Check if the backend is running locally: `cd apps/backend && bun run dev`
2. Verify production API: `curl https://analytics-api-backend.fly.dev/health`
3. Check browser console for CORS errors
4. Verify environment configuration with the test page

### Wrong Environment
1. Check localStorage: `localStorage.getItem('apiEnvironment')`
2. Clear overrides: `localStorage.removeItem('apiEnvironment')`
3. Check URL for `?api=` parameter
4. Verify `.env.local` settings

### CORS Issues
If you see CORS errors:
1. Ensure the backend is configured with correct origins
2. Update Fly.io secrets if needed:
```bash
cd apps/backend
flyctl secrets set CORS_ORIGINS="https://your-domain.com,https://your-app.vercel.app"
```

## 📈 Next Steps

1. Deploy frontend to Vercel
2. Update CORS_ORIGINS on Fly.io to include your Vercel URL
3. Set `NEXT_PUBLIC_API_ENV=production` in Vercel environment variables
4. Test production deployment with real API
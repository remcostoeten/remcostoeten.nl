# Blog Pageview Tracking - Release Documentation

## 🎯 Overview

Your blog has a complete pageview tracking system that records and displays view counts for each post. This document covers the implementation, testing, and release checklist.

---

## 📊 How It Works

### Frontend Flow:
1. User visits blog post (`/posts/[slug]`)
2. `ViewCounter` component loads current view count
3. After 2 seconds (bounce protection), increments view count
4. Updated count displays in real-time

### Backend Flow:
1. POST request to `/api/blog/analytics/:slug/view`
2. Increments `totalViews` in `blog_analytics` table
3. Returns success response
4. Frontend fetches updated count

---

## 🔧 Architecture

### Database Schema (`blog_analytics` table):
```sql
- id: text (PRIMARY KEY)
- slug: text (UNIQUE, indexed)
- totalViews: integer (default: 0)
- uniqueViews: integer (default: 0)
- recentViews: integer (views in last 30 days)
- lastViewedAt: timestamp
- createdAt: timestamp
- updatedAt: timestamp
```

### API Endpoints:

#### 1. Increment View Count
```
POST /api/blog/analytics/:slug/view
Response: { success: true, message: "View count incremented" }
```

#### 2. Get View Count
```
GET /api/blog/analytics/:slug
Response: {
  success: true,
  data: {
    slug: "post-slug",
    totalViews: 123,
    uniqueViews: 45,
    ...
  }
}
```

#### 3. Get Multiple View Counts
```
POST /api/blog/analytics/multiple
Body: { slugs: ["slug-1", "slug-2"] }
Response: {
  success: true,
  data: [
    { slug: "slug-1", totalViews: 100, uniqueViews: 30 },
    { slug: "slug-2", totalViews: 200, uniqueViews: 60 }
  ]
}
```

---

## 🐛 Issues Fixed

### 1. **Frontend-Backend Response Mapping** ✅
**Problem:** Frontend expected `viewCount`, backend returned `totalViews`

**Fixed in:** `src/services/views-service.ts`
```typescript
totalViews: analytics.totalViews || analytics.viewCount || analytics.views || 0
```

### 2. **Missing Analytics Records** ✅
**Problem:** New blog posts don't have analytics records

**Solution:** Initialization script created
```bash
# Run in backend directory
bun run tsx src/scripts/init-blog-analytics.ts
```

### 3. **Error Handling** ✅
**Problem:** Crashes when analytics missing

**Fixed:** Graceful fallback to 0 views in ViewsService

---

## ✅ Pre-Release Checklist

### Backend (apps/backend):

- [ ] **Run database initialization**
  ```bash
  cd apps/backend
  bun run tsx src/scripts/init-blog-analytics.ts
  ```

- [ ] **Verify all blog posts have analytics records**
  ```sql
  SELECT b.slug, a.totalViews 
  FROM blog_metadata b
  LEFT JOIN blog_analytics a ON b.slug = a.slug;
  ```

- [ ] **Test increment endpoint**
  ```bash
  curl -X POST https://analytics-api-backend.fly.dev/api/blog/analytics/test-slug/view
  ```

- [ ] **Test get endpoint**
  ```bash
  curl https://analytics-api-backend.fly.dev/api/blog/analytics/test-slug
  ```

### Frontend (apps/frontend):

- [ ] **Verify ViewCounter component on blog posts**
  - Visit any post: `/posts/[slug]`
  - Check that view count displays
  - Wait 2 seconds, verify count increments

- [ ] **Verify view counts on blog list**
  - Visit `/posts`
  - Check that all blog cards show view counts

- [ ] **Test with production API**
  - Ensure `NEXT_PUBLIC_API_ENV=production` (or use switcher)
  - Verify API calls go to Fly.io backend

- [ ] **Test error handling**
  - Block network requests
  - Verify graceful fallback (shows 0 views, no crash)

---

## 🧪 Testing Guide

### Manual Testing:

#### 1. **Single Post View Count**
```bash
# Visit a blog post
open http://localhost:3000/posts/your-slug

# Check browser console for:
# - Initial view count fetch
# - View increment after 2 seconds
# - No errors
```

#### 2. **Blog List View Counts**
```bash
# Visit blog list
open http://localhost:3000/posts

# Verify:
# - All posts show view counts
# - Numbers look reasonable
# - No "0 views" for popular posts
```

#### 3. **View Increment**
```bash
# Test increment manually
curl -X POST http://localhost:4001/api/blog/analytics/test-slug/view

# Then check count
curl http://localhost:4001/api/blog/analytics/test-slug
```

### Automated Testing (Optional):

```typescript
// Example test
describe('ViewCounter', () => {
  it('displays view count', async () => {
    const { getByText } = render(<ViewCounter slug="test" />);
    await waitFor(() => {
      expect(getByText(/views/)).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Deployment Steps

### 1. Backend Deployment

```bash
cd apps/backend

# Run initialization script
bun run tsx src/scripts/init-blog-analytics.ts

# Deploy to Fly.io
flyctl deploy

# Verify health
curl https://analytics-api-backend.fly.dev/health
```

### 2. Frontend Deployment

```bash
cd apps/frontend

# Build production bundle
bun run build

# Deploy to Vercel/Netlify
vercel --prod
# or
netlify deploy --prod
```

### 3. Post-Deployment Verification

```bash
# Test production endpoints
curl https://remcostoeten.nl/api/health
curl https://analytics-api-backend.fly.dev/api/blog/analytics/test-slug

# Visit production site
open https://remcostoeten.nl/posts
```

---

## 📈 Monitoring

### Metrics to Track:

1. **View Count Accuracy**
   - Compare with Google Analytics
   - Check for anomalies (sudden spikes/drops)

2. **API Response Times**
   - Monitor `/blog/analytics` endpoints
   - Target: < 200ms

3. **Error Rates**
   - Watch for 404s (missing analytics)
   - Watch for 500s (server errors)

### Database Queries for Monitoring:

```sql
-- Total views across all posts
SELECT SUM(totalViews) as total_views FROM blog_analytics;

-- Most popular posts
SELECT slug, totalViews 
FROM blog_analytics 
ORDER BY totalViews DESC 
LIMIT 10;

-- Posts with missing analytics
SELECT b.slug 
FROM blog_metadata b
LEFT JOIN blog_analytics a ON b.slug = a.slug
WHERE a.slug IS NULL;

-- Recent activity
SELECT slug, totalViews, lastViewedAt
FROM blog_analytics
WHERE lastViewedAt > NOW() - INTERVAL '7 days'
ORDER BY lastViewedAt DESC;
```

---

## 🔥 Common Issues & Solutions

### Issue 1: "0 views" on all posts
**Cause:** Missing analytics records
**Solution:**
```bash
cd apps/backend
bun run tsx src/scripts/init-blog-analytics.ts
```

### Issue 2: View count not incrementing
**Cause:** API environment pointing to wrong backend
**Solution:**
- Check API environment switcher (bottom right)
- Verify `NEXT_PUBLIC_API_ENV` in `.env`
- Check browser console for API errors

### Issue 3: View count increments multiple times
**Cause:** React Strict Mode in development
**Solution:** This is normal in dev mode. Test in production build.

### Issue 4: Views not persisting
**Cause:** Using in-memory storage instead of database
**Solution:** Check `STORAGE_TYPE=database` in backend `.env`

---

## 📋 Environment Variables

### Backend `.env`:
```bash
DATABASE_URL="postgresql://..."
STORAGE_TYPE="database"  # Important!
PORT=4001
```

### Frontend `.env.local`:
```bash
NEXT_PUBLIC_API_BASE=https://analytics-api-backend.fly.dev/api
# or
NEXT_PUBLIC_API_ENV=production
```

---

## 🎨 Component Usage

### ViewCounter Component:
```typescript
import { ViewCounter } from '@/components/blog/ViewCounter';

<ViewCounter 
  slug="post-slug"
  autoIncrement={true}
  incrementDelay={2000}
  showIcon={true}
  className="text-sm text-muted-foreground"
/>
```

### useViewCount Hook:
```typescript
import { useViewCount } from '@/hooks/use-view-count';

function MyComponent() {
  const { viewCount, loading, error, recordView } = useViewCount('post-slug', {
    autoIncrement: false
  });
  
  return <div>{viewCount} views</div>;
}
```

---

## 🔐 Security Considerations

1. **Rate Limiting** (TODO)
   - Add rate limiting to prevent view count manipulation
   - Implement IP-based throttling

2. **Bot Detection** (TODO)
   - Filter out known bots/crawlers
   - Use User-Agent detection

3. **Session Tracking** (DONE)
   - Session ID prevents duplicate counts
   - Stored in localStorage

---

## 📊 Performance Optimizations

1. **Caching** (Implemented)
   - View counts cached on frontend
   - Reduces API calls

2. **Batch Requests** (Implemented)
   - `/blog/analytics/multiple` endpoint
   - Fetches all counts in one request

3. **Lazy Loading** (Implemented)
   - View counts load asynchronously
   - Don't block page render

---

## ✅ Release Readiness Checklist

Before going live, verify:

- [x] Backend analytics schema correct (`totalViews`)
- [x] Frontend ViewsService properly maps response
- [x] Error handling for missing records
- [x] Initialization script created
- [ ] All blog posts have analytics records
- [ ] Production API endpoints tested
- [ ] View increment working in production
- [ ] Blog list displays correct counts
- [ ] No console errors on blog pages
- [ ] Database backup created
- [ ] Monitoring alerts configured

---

## 🎉 Success Criteria

Your pageview tracking is **release-ready** when:

✅ All blog posts display view counts  
✅ Counts increment correctly on page views  
✅ No errors in browser console  
✅ API responds < 200ms  
✅ View counts persist across restarts  
✅ Blog list shows accurate counts  
✅ Error handling works gracefully  

---

## 🆘 Support

If issues persist after release:

1. Check browser console for errors
2. Verify API environment (local vs production)
3. Run initialization script
4. Check database connection
5. Review backend logs on Fly.io

**Ready to release!** 🚀

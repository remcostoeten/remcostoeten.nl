# Blog Feedback System - Deployment Guide

## Summary

A complete feedback voting system for blog posts has been implemented with the following features:

### ✅ Completed Features

1. **Elegant UI Component** (`apps/frontend/src/components/blog/blog-feedback.tsx`)
   - 5 emoji reactions: 🔥 💡 ❤️ 👏 🤔
   - Smooth animations with Framer Motion
   - AnimatedNumber component for vote counts
   - Hover effects and tooltips
   - Visual feedback for voted state
   - Optimistic UI updates

2. **Vote Toggling**
   - Users can vote on any emoji
   - Clicking the same emoji removes the vote
   - Users can switch votes by clicking a different emoji
   - Vote state is stored in localStorage per blog post

3. **Fingerprinting**
   - Client-side fingerprinting using canvas, user agent, screen resolution, and timezone
   - Server-side hash generation combining client fingerprint, IP, and user agent
   - Persistent fingerprint stored in localStorage

4. **Rate Limiting**
   - Backend rate limiting: max 5 votes per 24 hours per IP per slug
   - Prevents abuse while allowing vote changes

5. **Backend API** (Updated in `apps/backend/src/`)
   - `POST /api/blog/feedback/:slug` - Submit or update vote
   - `DELETE /api/blog/feedback/:slug?fingerprint=X` - Remove vote
   - `GET /api/blog/feedback/:slug/reactions` - Get vote counts
   - `GET /api/blog/feedback/:slug` - Get full feedback stats
   - `GET /api/blog/feedback/:slug/user?fingerprint=X` - Get user's vote

6. **Database Schema** (`blog_feedback` table)
   - Unique constraint on (slug, fingerprint) prevents duplicate votes
   - Indexes on slug, emoji, fingerprint, and timestamp
   - IP hashing for privacy

## 🚀 Deployment Steps

### 1. Deploy Backend to Fly.io

The backend code is ready but needs to be deployed:

```bash
cd apps/backend

# Deploy to Fly.io
fly deploy

# Verify deployment
curl https://backend-thrumming-cloud-5273.fly.dev/health
```

### 2. Verify Database Connection

Ensure the `DATABASE_URL` environment variable is set on Fly.io:

```bash
# Check current secrets
fly secrets list

# If DATABASE_URL is missing, set it
fly secrets set DATABASE_URL="postgresql://..."
```

### 3. Run Database Migrations

After deployment, the migrations should run automatically, but verify:

```bash
# SSH into the Fly.io instance
fly ssh console

# Run migrations if needed
cd /app && bun run push
```

### 4. Test the API

Use the provided test script:

```bash
./test-feedback.sh
```

Expected output:
- Step 1: Empty array or existing reactions
- Step 2: Success response with feedback data
- Step 3: Reactions array with 1 vote for 🔥
- Step 4: Full stats including the vote
- Step 5: Success response with removed: true
- Step 6: Empty array or reactions without the removed vote

### 5. Test Frontend Locally

```bash
cd apps/frontend
bun run dev
```

Visit any blog post and:
1. Click an emoji - should increment count and highlight
2. Click same emoji again - should decrement count and unhighlight
3. Click different emoji - should switch votes
4. Refresh page - vote should persist
5. Open in incognito - should see different vote state

## 🔍 Testing Checklist

- [ ] Backend deploys successfully to Fly.io
- [ ] Health endpoint returns 200
- [ ] Feedback endpoints return data (not 404)
- [ ] Can submit votes via API
- [ ] Votes are stored in database
- [ ] Can remove votes via API
- [ ] Rate limiting works (5 votes per 24h)
- [ ] Fingerprint prevents duplicate votes
- [ ] Frontend component renders emojis
- [ ] Vote counts display correctly with AnimatedNumber
- [ ] Clicking emoji increments count
- [ ] Clicking same emoji removes vote
- [ ] Switching votes works correctly
- [ ] Vote state persists after page refresh
- [ ] Different browsers/devices have separate votes
- [ ] Hover tooltips display correctly
- [ ] Loading states work properly
- [ ] Error messages display when needed

## 🐛 Troubleshooting

### Issue: API returns 404

**Cause**: Backend not deployed or routes not registered

**Solution**:
```bash
cd apps/backend
fly deploy
```

### Issue: Database connection errors

**Cause**: Missing or incorrect DATABASE_URL

**Solution**:
```bash
fly secrets set DATABASE_URL="your-postgres-url"
fly restart
```

### Issue: Votes not persisting

**Cause**: Database table doesn't exist

**Solution**:
```bash
cd apps/backend
bun run gen  # Generate migrations
bun run push # Apply to database
```

### Issue: Component not rendering

**Cause**: Import path incorrect

**Solution**:
Verify the import in `apps/frontend/src/app/posts/[slug]/page.tsx`:
```typescript
import { BlogFeedback } from "@/components/blog/blog-feedback";
```

### Issue: AnimatedNumber not animating

**Cause**: Motion preferences or missing dependency

**Solution**:
```bash
cd apps/frontend
bun install @number-flow/react
```

## 📝 API Examples

### Submit Vote
```bash
curl -X POST "https://backend-thrumming-cloud-5273.fly.dev/api/blog/feedback/my-post-slug" \
  -H "Content-Type: application/json" \
  -d '{
    "emoji": "🔥",
    "fingerprint": "user-fingerprint-here",
    "url": "https://remcostoeten.nl/posts/my-post-slug",
    "userAgent": "Mozilla/5.0..."
  }'
```

### Get Reactions
```bash
curl "https://backend-thrumming-cloud-5273.fly.dev/api/blog/feedback/my-post-slug/reactions"
```

### Remove Vote
```bash
curl -X DELETE "https://backend-thrumming-cloud-5273.fly.dev/api/blog/feedback/my-post-slug?fingerprint=user-fingerprint-here"
```

## 🎨 UI Customization

The component styling can be customized via className prop:

```tsx
<BlogFeedback slug={slug} className="custom-class" />
```

Key styling areas:
- Container background: `bg-muted/20`
- Hover state: `hover:bg-muted/30`
- Voted state: `bg-accent/15 border-accent/50`
- Vote count badge: `bg-accent` (voted) or `bg-muted` (not voted)

## 📊 Database Schema

```sql
CREATE TABLE blog_feedback (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  message TEXT,
  url TEXT,
  user_agent TEXT,
  ip_hash VARCHAR(64),
  fingerprint VARCHAR(64),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT blog_feedback_slug_fingerprint_unique UNIQUE (slug, fingerprint)
);

CREATE INDEX blog_feedback_slug_idx ON blog_feedback(slug);
CREATE INDEX blog_feedback_emoji_idx ON blog_feedback(emoji);
CREATE INDEX blog_feedback_fingerprint_idx ON blog_feedback(fingerprint);
CREATE INDEX blog_feedback_timestamp_idx ON blog_feedback(timestamp);
```

## 🔐 Security Features

1. **IP Hashing**: IPs are hashed with SHA-256, never stored in plain text
2. **Rate Limiting**: Max 5 votes per 24 hours per IP per slug
3. **Fingerprint Validation**: Server-side fingerprint generation prevents client manipulation
4. **CORS**: Configured to allow only your domains
5. **Unique Constraint**: Prevents duplicate votes at database level

## 🚦 Next Steps

1. Deploy the backend to Fly.io
2. Verify all API endpoints work
3. Test the frontend component
4. Monitor for any errors in production
5. Consider adding analytics to track feedback engagement
6. Optionally add admin dashboard to view feedback stats

## 📞 Support

If you encounter issues:
1. Check backend logs: `fly logs`
2. Check database connection: `fly ssh console` then test DB connection
3. Verify environment variables: `fly secrets list`
4. Test API endpoints manually with curl
5. Check browser console for frontend errors

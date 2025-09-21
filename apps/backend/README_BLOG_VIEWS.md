# Blog Views Tracking System

This system tracks unique blog post views with session-based deduplication to prevent view inflation from page refreshes.

## Features

- **Session-based tracking**: Only counts unique views per browser session per post
- **Database storage**: Uses PostgreSQL with Drizzle ORM
- **Memory fallback**: Falls back to in-memory storage if database is unavailable
- **Comprehensive API**: Full CRUD operations for blog views
- **Analytics**: View statistics and top posts tracking
- **IP & User Agent tracking**: For enhanced analytics

## Database Schema

```sql
CREATE TABLE "blog_views" (
  "id" text PRIMARY KEY,
  "slug" text NOT NULL,
  "session_id" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "referrer" text,
  "timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
  CONSTRAINT "blog_views_session_id_slug_unique" UNIQUE("session_id","slug")
);
```

## API Endpoints

### Record a View
```
POST /api/blog/views
{
  "slug": "my-blog-post",
  "sessionId": "session-123",
  "ipAddress": "192.168.1.1", // optional
  "userAgent": "Mozilla/5.0...", // optional
  "referrer": "https://google.com" // optional
}
```

### Get View Count for Single Post
```
GET /api/blog/views/my-blog-post
```

### Get View Counts for Multiple Posts
```
POST /api/blog/views/multiple
{
  "slugs": ["post-1", "post-2", "post-3"]
}
```

### Get View Statistics
```
GET /api/blog/views/stats
```

### Get All Views (with filtering)
```
GET /api/blog/views?slug=my-post&limit=50&offset=0
```

## How It Works

1. **First Visit**: When a user visits a blog post, a unique session ID is generated and stored in sessionStorage
2. **View Recording**: The view is recorded with the session ID and post slug
3. **Duplicate Prevention**: Database unique constraint prevents duplicate views from same session
4. **Refresh Protection**: Page refreshes use the same session ID, so no new view is recorded
5. **New Session**: New browser session = new session ID = new view count

## Session Management

- **Session ID**: Generated client-side, stored in `sessionStorage`
- **Persistence**: Survives page refreshes but not browser restarts
- **Format**: `session-{timestamp}-{random}`

## Usage in Frontend

```tsx
// Auto-record view on page load
<ViewCounter slug="my-post" autoIncrement={true} />

// Display only (for lists)
<ViewCounter slug="my-post" autoIncrement={false} />

// Multiple view counts
const { getViewCount } = useMultipleViewCounts(['post-1', 'post-2']);
```

## Migration

Run the migration to create the blog_views table:

```bash
# Generate migration (if schema changes)
bun run gen

# Push to database
bun run push
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:port/db
```

If `DATABASE_URL` is not provided, the system will use in-memory storage as a fallback.
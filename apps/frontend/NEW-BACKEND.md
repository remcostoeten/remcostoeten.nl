# New Backend Architecture & API Specification

This document outlines all backend endpoints currently used by the frontend and provides a clean foundation for rebuilding the backend with better architecture and consistency.

## Current Issues with Existing Backend

1. **Inconsistent API patterns** - Mix of REST and custom endpoints
2. **Poor error handling** - Frontend expects success/data pattern but backend doesn't always deliver
3. **Duplicate functionality** - Multiple ways to get blog analytics
4. **Missing type safety** - Inconsistent response formats
5. **Environment configuration** - Complex and brittle endpoint management
6. **Rate limiting** - Implemented inconsistently across features

## Proposed Backend Architecture

### Base URL Structure
```
Local Development: http://localhost:4001
Production: https://api.remcostoeten.nl (clean domain)
```

### API Versioning
All endpoints should be versioned: `/api/v1/`

### Standard Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
```

### Error Response Format
```typescript
interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}
```

---

## API Endpoints Specification

### 1. Health Check

#### `GET /api/v1/health`
**Purpose**: Basic health check for monitoring services
**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

**Frontend Integration**: Used by monitoring tools and environment widgets

---

### 2. Visitor Tracking & Analytics

#### `POST /api/v1/visitors/track`
**Purpose**: Track new visitors or return existing visitors
**Request Body**:
```typescript
{
  visitorId?: string; // Optional - if provided, updates existing visitor
  userAgent: string;
  acceptLanguage: string;
  screenResolution: string;
  timezone: string;
  platform: string;
  language: string;
  referrer: string;
}
```
**Response**:
```typescript
{
  "success": true,
  "data": {
    "visitorId": "uuid-string",
    "isNewVisitor": boolean,
    "totalVisits": number,
    "lastVisitAt": string
  }
}
```

#### `POST /api/v1/visitors/track-blog-view`
**Purpose**: Track when a visitor views a blog post
**Request Body**:
```typescript
{
  visitorId: string;
  blogSlug: string;
  blogTitle: string;
}
```
**Response**:
```typescript
{
  "success": true,
  "data": {
    "viewId": "uuid-string",
    "isNewView": boolean,
    "totalBlogViews": number
  }
}
```

#### `GET /api/v1/visitors/stats`
**Purpose**: Get visitor statistics for analytics dashboard
**Response**:
```typescript
{
  "success": true,
  "data": {
    "totalVisitors": number,
    "newVisitors": number,
    "returningVisitors": number,
    "totalBlogViews": number,
    "uniqueBlogViews": number,
    "topBlogPosts": Array<{
      slug: string;
      title: string;
      viewCount: number;
      uniqueViewers: number;
    }>,
    "recentVisitors": Array<{
      visitorId: string;
      isNewVisitor: boolean;
      totalVisits: number;
      lastVisitAt: string;
    }>
  }
}
```

#### `GET /api/v1/visitors/blog/{slug}/views`
**Purpose**: Get view count for specific blog post
**Response**:
```typescript
{
  "success": true,
  "data": {
    "slug": string,
    "totalViews": number,
    "uniqueViews: number,
    "recentViews": number,
    "lastViewedAt": string
  }
}
```

---

### 3. Pageview Tracking

#### `POST /api/v1/pageviews`
**Purpose**: Track individual page views
**Request Headers**:
- `X-Screen-Resolution`: string
- `X-Timezone`: string
- `X-Platform`: string
- `X-Session-ID`: string

**Request Body**:
```typescript
{
  url: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: string;
}
```
**Response**:
```typescript
{
  "success": true,
  "data": {
    "pageviewId": "uuid-string",
    "trackedAt": string
  }
}
```

#### `GET /api/v1/pageviews/stats`
**Purpose**: Get pageview statistics
**Response**:
```typescript
{
  "success": true,
  "data": {
    "total": number,
    "today": number,
    "yesterday": number,
    "thisWeek": number,
    "uniqueUrls": number,
    "topPages": Array<{
      url: string;
      count: number;
    }>
  }
}
```

---

### 4. Blog Analytics

#### `POST /api/v1/blog/analytics/{slug}/view`
**Purpose**: Increment blog view count (simplified endpoint)
**Headers**:
- `X-Session-ID`: string (for deduplication)
- `X-User-Agent`: string
- `X-Referrer`: string

**Response**:
```typescript
{
  "success": true,
  "data": {
    "slug": string,
    "totalViews": number,
    "uniqueViews": number,
    "isNewView": boolean
  }
}
```

#### `GET /api/v1/blog/analytics/{slug}`
**Purpose**: Get analytics for specific blog post
**Response**:
```typescript
{
  "success": true,
  "data": {
    "slug": string,
    "totalViews": number,
    "uniqueViews": number,
    "recentViews": number,
    "lastViewedAt": string,
    "dailyViews": Array<{
      date: string;
      views: number;
      uniqueViews: number;
    }>
  }
}
```

#### `POST /api/v1/blog/analytics/multiple`
**Purpose**: Get analytics for multiple blog posts
**Request Body**:
```typescript
{
  slugs: string[];
}
```
**Response**:
```typescript
{
  "success": true,
  "data": Array<{
    slug: string;
    totalViews: number;
    uniqueViews: number;
    recentViews: number;
  }>
}
```

#### `GET /api/v1/blog/analytics/stats`
**Purpose**: Get overall blog analytics
**Response**:
```typescript
{
  "success": true,
  "data": {
    "totalBlogPosts": number;
    "totalViews": number;
    "totalUniqueViews": number;
    "averageViewsPerPost": number;
    "topPosts": Array<{
      slug: string;
      title: string;
      viewCount: number;
      uniqueViewers: number;
    }>
  }
}
```

---

### 5. Blog Metadata Management

#### `POST /api/v1/blog/metadata`
**Purpose**: Create blog metadata
**Request Body**:
```typescript
{
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: string;
  status: 'published' | 'draft';
  author?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

#### `GET /api/v1/blog/metadata`
**Purpose**: Get all blog metadata with analytics
**Response**:
```typescript
{
  "success": true,
  "data": Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    readTime: number;
    tags: string[];
    category: string;
    status: 'published' | 'draft';
    author?: string;
    seo?: {...};
    analytics?: {
      id: string;
      slug: string;
      totalViews: number;
      uniqueViews: number;
      recentViews: number;
      lastViewedAt?: string;
      createdAt: string;
      updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
  }>
}
```

#### `GET /api/v1/blog/metadata/{slug}`
**Purpose**: Get specific blog metadata
**Response**: Single metadata object (same structure as array items above)

#### `PUT /api/v1/blog/metadata/{slug}`
**Purpose**: Update blog metadata
**Request Body**: Same as create metadata

#### `DELETE /api/v1/blog/metadata/{slug}`
**Purpose**: Delete blog metadata

---

### 6. Blog Feedback System

#### `POST /api/v1/blog/feedback/{slug}`
**Purpose**: Submit feedback for blog post
**Query Parameters**:
- `fingerprint`: string (for deduplication)

**Request Body**:
```typescript
{
  emoji: string;
  message?: string;
  url: string;
  userAgent?: string;
}
```
**Response**:
```typescript
{
  "success": true,
  "data": {
    id: string;
    emoji: string;
    message?: string;
    timestamp: string;
    url: string;
    fingerprint: string;
  }
}
```

#### `GET /api/v1/blog/feedback/{slug}/reactions`
**Purpose**: Get aggregated reactions for blog post
**Response**:
```typescript
{
  "success": true,
  "data": Array<{
    emoji: string;
    count: number;
    label: string;
  }>
}
```

#### `GET /api/v1/blog/feedback/{slug}`
**Purpose**: Get comprehensive feedback for blog post
**Response**:
```typescript
{
  "success": true,
  "data": {
    total: number;
    reactions: Array<{
      emoji: string;
      count: number;
      label: string;
    }>;
    recentFeedback: Array<{
      emoji: string;
      message?: string;
      timestamp: string;
      url: string;
    }>;
  }
}
```

#### `GET /api/v1/blog/feedback`
**Purpose**: Get all feedback (admin endpoint)
**Response**: Array of all feedback submissions

---

### 7. Contact Form

#### `POST /api/v1/contact`
**Purpose**: Submit contact form
**Request Body**:
```typescript
{
  name: string;
  email: string;
  message: string;
  subject?: string;
  phone?: string;
}
```
**Response**:
```typescript
{
  "success": true,
  "data": {
    id: string;
    submittedAt: string;
    status: 'pending' | 'read' | 'responded';
  }
}
```

#### `GET /api/v1/contact`
**Purpose**: Get all contact messages (admin)
**Query Parameters**:
- `status`: 'pending' | 'read' | 'responded' (optional)
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response**:
```typescript
{
  "success": true,
  "data": {
    messages: Array<{
      id: string;
      name: string;
      email: string;
      subject?: string;
      message: string;
      phone?: string;
      status: 'pending' | 'read' | 'responded';
      submittedAt: string;
      readAt?: string;
      respondedAt?: string;
    }>;
    total: number;
    hasMore: boolean;
  }
}
```

#### `PUT /api/v1/contact/{id}/read`
**Purpose**: Mark contact message as read
**Response**:
```typescript
{
  "success": true,
  "data": {
    id: string;
    status: 'read';
    readAt: string;
  }
}
```

#### `DELETE /api/v1/contact/{id}`
**Purpose**: Delete contact message (admin)

---

## Frontend Integration Patterns

### 1. API Client Configuration

The frontend expects a centralized API configuration similar to the current `src/config/api.config.ts` but simplified:

```typescript
export const API_CONFIG = {
  base: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001',
  version: 'v1',
  timeout: 10000,
};

export function buildUrl(endpoint: string): string {
  return `${API_CONFIG.base}/api/${API_CONFIG.version}${endpoint}`;
}
```

### 2. Standard API Client

The frontend expects an `apiFetch` wrapper that:
- Handles JSON serialization/deserialization
- Includes credentials for session tracking
- Provides consistent error handling
- Supports timeout and retry logic
- Returns standardized `{ success, data, error }` format

```typescript
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  // Implementation with error handling, timeout, etc.
}
```

### 3. Session Management

The frontend expects:
- Session ID generation and persistence
- Visitor fingerprinting for deduplication
- Local storage for caching and rate limiting
- Headers for session tracking: `X-Session-ID`, `X-User-Agent`, `X-Referrer`

### 4. Error Handling

The frontend expects:
- Consistent error format across all endpoints
- Graceful degradation when backend is unavailable
- Local storage fallbacks for cached data
- Clear error messages for user feedback

### 5. Rate Limiting

The frontend implements client-side rate limiting for:
- Feedback submissions (3 per day per post)
- Analytics requests (100 per hour)
- Contact form submissions (5 per hour per email)

Backend should support:
- Rate limit headers in responses
- 429 status codes with `Retry-After` headers
- IP-based and user-based rate limiting

---

## Database Schema Recommendations

### Core Tables

```sql
-- Visitors
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT UNIQUE NOT NULL,
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_visits INTEGER DEFAULT 1,
  user_agent TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  platform TEXT,
  language TEXT,
  referrer TEXT,
  is_new_visitor BOOLEAN DEFAULT true
);

-- Pageviews
CREATE TABLE pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES visitors(id),
  url TEXT NOT NULL,
  title TEXT,
  referrer TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  platform TEXT
);

-- Blog Posts
CREATE TABLE blog_posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  read_time INTEGER,
  tags TEXT[],
  category TEXT,
  status TEXT CHECK (status IN ('published', 'draft')),
  author TEXT,
  seo JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Analytics
CREATE TABLE blog_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT REFERENCES blog_posts(slug),
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  recent_views INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_slug)
);

-- Blog Views (individual views)
CREATE TABLE blog_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT REFERENCES blog_posts(slug),
  visitor_id UUID REFERENCES visitors(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  is_unique_view BOOLEAN DEFAULT false,
  fingerprint TEXT
);

-- Blog Feedback
CREATE TABLE blog_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_slug TEXT REFERENCES blog_posts(slug),
  emoji TEXT NOT NULL,
  message TEXT,
  url TEXT,
  user_agent TEXT,
  fingerprint TEXT,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  phone TEXT,
  status TEXT CHECK (status IN ('pending', 'read', 'responded')) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_visitors_fingerprint ON visitors(fingerprint);
CREATE INDEX idx_visitors_last_visit ON visitors(last_visit_at DESC);
CREATE INDEX idx_pageviews_visitor_id ON pageviews(visitor_id);
CREATE INDEX idx_pageviews_timestamp ON pageviews(timestamp DESC);
CREATE INDEX idx_pageviews_url ON pageviews(url);
CREATE INDEX idx_blog_views_slug ON blog_views(blog_slug);
CREATE INDEX idx_blog_views_visitor ON blog_views(visitor_id);
CREATE INDEX idx_blog_views_timestamp ON blog_views(viewed_at DESC);
CREATE INDEX idx_blog_feedback_slug ON blog_feedback(blog_slug);
CREATE INDEX idx_blog_feedback_timestamp ON blog_feedback(timestamp DESC);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_submitted ON contact_messages(submitted_at DESC);
```

---

## Implementation Priority

### Phase 1: Core Analytics (High Priority)
1. `GET /api/v1/health`
2. `POST /api/v1/visitors/track`
3. `POST /api/v1/pageviews`
4. `POST /api/v1/blog/analytics/{slug}/view`
5. `GET /api/v1/blog/analytics/{slug}`

### Phase 2: Blog Features (Medium Priority)
1. `GET /api/v1/blog/analytics/multiple`
2. `GET /api/v1/blog/analytics/stats`
3. `POST /api/v1/blog/feedback/{slug}`
4. `GET /api/v1/blog/feedback/{slug}/reactions`

### Phase 3: Admin Features (Low Priority)
1. `GET /api/v1/visitors/stats`
2. `GET /api/v1/pageviews/stats`
3. `POST /api/v1/contact`
4. `GET /api/v1/contact`
5. Blog metadata endpoints

### Phase 4: Advanced Features (Future)
1. Real-time analytics via WebSocket
2. Export functionality
3. Advanced filtering and search
4. Analytics dashboards with charts

---

## Security Considerations

1. **Rate Limiting**: Implement both IP-based and user-based rate limiting
2. **CORS**: Configure proper CORS headers for frontend domain
3. **Input Validation**: Validate all inputs with proper error messages
4. **SQL Injection**: Use parameterized queries
5. **XSS Prevention**: Sanitize user input, especially feedback and contact forms
6. **Data Privacy**: Consider GDPR compliance for visitor tracking
7. **API Keys**: Consider API keys for admin endpoints
8. **HTTPS**: Enforce HTTPS in production

---

## Monitoring & Logging

1. **Request Logging**: Log all API requests with response times
2. **Error Tracking**: Implement error reporting (e.g., Sentry)
3. **Performance Monitoring**: Track API response times
4. **Health Checks**: Implement comprehensive health checks
5. **Analytics**: Track API usage patterns
6. **Alerts**: Set up alerts for high error rates or downtime

---

## Deployment Considerations

1. **Environment Variables**: All configuration via environment variables
2. **Database Migrations**: Version-controlled database schema changes
3. **Blue-Green Deployment**: Zero-downtime deployments
4. **Load Balancing**: Support for horizontal scaling
5. **Caching**: Redis for session data and analytics cache
6. **Backup Strategy**: Regular database backups
7. **Monitoring**: Application performance monitoring

This architecture provides a clean, scalable foundation that addresses the current issues while maintaining all functionality the frontend depends on.
# CMS Authentication Setup

## Overview

The CMS is now protected with better-auth authentication and middleware-based route protection.

## Components

### 1. Authentication Setup

**Files:**
- `src/auth/options.ts` - Better-auth configuration
- `src/app/api/auth/[...all]/route.ts` - Auth API routes
- `src/middleware.ts` - Route protection middleware

**Features:**
- Email/password authentication
- GitHub OAuth (optional)
- Email-based authorization (only specific emails allowed)
- Session management

### 2. Protected Routes

**Admin Routes:**
- `/admin/*` - All admin routes require authentication
- Redirects to `/auth/signin` if not authenticated
- Redirects to `/auth/unauthorized` if email not authorized

**API Routes:**
- `/api/cms/*` - All CMS API routes require valid session token
- Returns 401/403 status codes for unauthorized access

### 3. Authorization

**Allowed Users:**
- `remcostoeten@hotmail.com`
- Any email ending with `@remcostoeten`

**Configuration:**
Update `ALLOWED_EMAILS` array in `src/middleware.ts` to add more authorized users.

### 4. Environment Variables

Required in `.env.local`:

```env
# Better Auth
AUTH_SECRET="your-long-random-secret-key-here-at-least-32-characters"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Admin Toggle (for development)
NEXT_PUBLIC_ADMIN_TOGGLE="true"
```

## Usage

### For Users

1. **Access Admin:**
   - Navigate to `/admin/cms` or use the keyboard shortcut (Space Space Space Backspace Backspace Backspace)
   - You'll be redirected to `/auth/signin` if not authenticated

2. **Sign In:**
   - Use email/password or GitHub OAuth
   - Only authorized emails can access the CMS

3. **Sign Out:**
   - Click "Sign Out" button in the admin interface

### For Developers

1. **Add New Authorized User:**
   ```typescript
   const ALLOWED_EMAILS = [
     "remcostoeten@hotmail.com",
     "newuser@example.com", // Add here
   ];
   ```

2. **Set Up GitHub OAuth:**
   - Create GitHub OAuth app
   - Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.local`

3. **Database Setup:**
   - Ensure auth tables exist in your database
   - Better-auth will create them automatically on first run

## Security Features

- **Route Protection:** Middleware prevents access to admin routes without authentication
- **Email Authorization:** Only specific emails can access the CMS
- **Session Management:** Uses secure session tokens
- **API Protection:** All CMS API endpoints require authentication
- **CSRF Protection:** Built into better-auth

## Current Limitations

- Session validation in middleware is basic (for demo purposes)
- Some client-side session management is mocked
- Production deployment would need enhanced security measures

## Next Steps

For production deployment:
1. Implement proper session validation in middleware
2. Add role-based permissions
3. Set up proper logging and monitoring
4. Configure secure cookie settings
5. Add rate limiting
6. Set up proper error handling

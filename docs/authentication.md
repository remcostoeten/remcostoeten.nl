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
- Configured via `AUTHORIZED_EMAILS` environment variable
- Defaults to `remcostoeten@hotmail.com` if not set

**Configuration:**
Set the `AUTHORIZED_EMAILS` environment variable with comma-separated email addresses:
```env
AUTHORIZED_EMAILS=remcostoeten@hotmail.com,another@email.com,third@example.com
```

### 4. Environment Variables

Required in `.env.local`:

```env
# Better Auth
AUTH_SECRET="your-long-random-secret-key-here-at-least-32-characters"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Authorized emails for CMS access (comma-separated)
AUTHORIZED_EMAILS="remcostoeten@hotmail.com,another@email.com"

# Admin Toggle (for development)
NEXT_PUBLIC_ADMIN_TOGGLE="true"

# Email Configuration
ADMIN_EMAIL="your-admin-email@example.com"
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="password123"
```

### 5. Registration Control

**Security Feature:** The `ENABLE_REGISTER` environment variable controls user registration:

- **`ENABLE_REGISTER="false"`** (default): Registration is disabled
  - Sign-up page shows disabled form with appropriate messaging
  - API endpoint returns 403 error for registration attempts
  - Sign-in page hides the "Sign up" link
  - Recommended for production with existing users

- **`ENABLE_REGISTER="true"`**: Registration is enabled
  - Full sign-up functionality available
  - Useful for fresh database setups or development
  - Should be set to `false` after initial user creation

## Usage

### For Users

1. **Access Admin:**
   - Navigate to `/admin/cms` or use the keyboard shortcut (Space Space Space Backspace Backspace Backspace)
   - You'll be redirected to `/auth/signin` if not authenticated

2. **Sign In:**
   - Use email/password authentication
   - Only authorized emails can access the CMS

3. **Sign Out:**
   - Click "Sign Out" button in the admin interface

### For Developers

1. **Add New Authorized User:**
   Add the new email to the `AUTHORIZED_EMAILS` environment variable:
   ```env
   AUTHORIZED_EMAILS=remcostoeten@hotmail.com,newuser@example.com
   ```

2. **Enable/Disable Registration:**
   ```bash
   # For fresh database setup (enable registration temporarily)
   ENABLE_REGISTER="true"
   
   # After creating initial users (disable for security)
   ENABLE_REGISTER="false"
   ```

4. **Database Setup:**
   - Ensure auth tables exist in your database
   - Better-auth will create them automatically on first run

## Security Features

- **Route Protection:** Middleware prevents access to admin routes without authentication
- **Email Authorization:** Only specific emails can access the CMS
- **Session Management:** Uses secure session tokens
- **API Protection:** All CMS API endpoints require authentication
- **CSRF Protection:** Built into better-auth

## Current Limitations

- Production deployment would need enhanced security measures

## Next Steps

For production deployment:
1. Implement proper session validation in middleware
2. Add role-based permissions
3. Set up proper logging and monitoring
4. Configure secure cookie settings
5. Add rate limiting
6. Set up proper error handling

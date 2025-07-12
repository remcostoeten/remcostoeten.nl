# GitHub OAuth Setup Guide

## What is GitHub OAuth Callback?

The GitHub OAuth callback is a URL that GitHub redirects users to after they authenticate with GitHub. It's part of the OAuth flow:

1. User clicks "Sign in with GitHub"
2. User is redirected to GitHub's authorization page
3. User authorizes your app
4. **GitHub redirects back to your callback URL** with an authorization code
5. Your app exchanges the code for an access token
6. User is now signed in

## Setting Up GitHub OAuth

### Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Your CMS Name` (e.g., "Remco's Personal CMS")
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Application description**: "Personal CMS authentication"
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

### Step 2: Get Your Credentials

After creating the app, GitHub will give you:
- **Client ID** (public, safe to expose)
- **Client Secret** (private, keep secret!)

### Step 3: Add to Environment Variables

Add these to your `.env.local` file:

```env
# GitHub OAuth
GITHUB_CLIENT_ID="your_client_id_here"
GITHUB_CLIENT_SECRET="your_client_secret_here"
```

### Step 4: For Production Deployment

When you deploy to production (e.g., Vercel), update the GitHub OAuth app settings:
- **Homepage URL**: `https://yourdomain.com`
- **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`

## Important Security Notes

- **Never commit secrets to Git** - Add `.env.local` to your `.gitignore`
- **Use different OAuth apps for development and production**
- **Rotate secrets regularly**
- **Only give minimal permissions needed**

## Testing the Setup

1. Set up the environment variables
2. Start your development server: `npm run dev`
3. Navigate to `/auth/signin`
4. Click "Sign in with GitHub"
5. You should be redirected to GitHub, then back to your app after authorization

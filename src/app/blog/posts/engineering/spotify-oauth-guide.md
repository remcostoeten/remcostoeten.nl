---
title: "Spotify OAuth2 Setup Tutorial: Working Redirects, Tokens, and Refresh Logic"
publishedAt: "20-12-2025"
summary: "A guide for setting up Spotify OAuth2 to obtain access and refresh tokens and API integration."
categories: ["Engineering", "Spotify API", "OAuth2", "Guide"]
tags: ["Engineering", "Authentication", "OAuth2", "Guide", "Next.js"]
slug: "spotify-oauth2-working-setup"
---
Accessing the Spotify API requires configuring OAuth2. It is not overly complex, although Spotify adds a few extra steps compared to providers like GitHub or Google. These differences cost me hours of debugging due to browser caching and redirect quirks, so I’m documenting the full workflow to save you time.

### In this guide we will

- create a Spotify developer application  
- configure redirect and callback URLs  
- obtain the client ID and client secret  
- implement refresh token generation  
- use the access token to make authenticated API calls  

The examples use Next.js for convenience, though the concepts translate cleanly to Node.js or any backend framework. You only need minimal familiarity with Next.js to follow along.

---

## Spotify Developer Account

You will need a Spotify developer account to create an OAuth2 application. Navigate to the developer dashboard and click “Create app”, then fill in the fields:

- **Name**: any label for your integration  
- **Description**: a short explanation  
- **Website**: optional for development  
- **Redirect URIs**: the callback endpoint in your project

<NoticeWarning title="API Setup Required">
If you don't have an API setup yet, I'll be showing how to [implement the API routes here](#routes).
</NoticeWarning>
Most implementations use something like:

```bash
/api/spotify/callback
```

### Important: Spotify rejects localhost

This is the first part which is new for most. Setting the url to `http://localhost:3000` will not work.

Instead register the loopback IP form:

```bash
http://127.0.0.1:3000/api/spotify/callback
```

*Both map to your machine, but Spotify validates them differently. `localhost` is a hostname that depends on DNS resolution. `127.0.0.1` is an explicit IP address and always resolves to the local interface, which is why Spotify accepts it. Make sure your OAuth redirect in your code matches exactly what you register in the developer dashboard.*

Last question is: Which API/SDKs are you planning to use? Fill in your usecase (most likely web) and click "Save". After having pressed save you'll see your client ID, and secret if you press "View client secret". Copy these, and add to your `.env`or `.env.local` file like so:

```bash
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
```

<NoticeInfo title="The more you know">
It doesn't matter whether you use quotes around your environment variable values. All of these work:
- `SPOTIFY_CLIENT_ID=value`
- `SPOTIFY_CLIENT_ID="value"`
- `SPOTIFY_CLIENT_ID='value'`
</NoticeInfo>
*If your API calls for different variable names than these two, obviously change those.*
Next we will configure the authorization code flow, exchanging the temporary code for both an access token and a refresh token.

### API Routes {#routes}

Now you'll have to implement the API route which you registered in the developer dashboard. Like I mentioned this implementation is following Next.js but you should just register an api in your desired framework.

Create the api route
```bash
touch src/app/api/spotify/callback/route.ts
## or app/api/spotify/callback/route.ts if no src dir
```
And insert your improved GET request handler:

<NoticeInfo title="Improvements made">
- Environment validation at startup fails fast if credentials are missing
- Helper function reduces URL construction duplication
- Better error handling with fallbacks for JSON parsing
- Consistent redirect URI usage from environment variables
</NoticeInfo>
```typescript
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

// Validate required environment variables at startup
const requiredEnv = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/api/spotify/callback'
};

if (!requiredEnv.clientId || !requiredEnv.clientSecret) {
  throw new Error('Missing required Spotify OAuth credentials');
}

function createRedirectUrl(baseUrl: string, params: Record<string, string>) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(createRedirectUrl('/', { error }));
    }

    if (!code) {
      return NextResponse.redirect(createRedirectUrl('/', { error: 'no_code' }));
    }

    // Exchange code for tokens
    const authString = `${requiredEnv.clientId}:${requiredEnv.clientSecret}`;
    const base64Auth = Buffer.from(authString).toString('base64');

    const tokenResponse = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Auth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: requiredEnv.redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      return NextResponse.redirect(
        createRedirectUrl('/', {
          error: 'token_exchange_failed',
          details: errorData.error_description || errorData.error || 'unknown'
        })
      );
    }

    const { refresh_token, access_token } = await tokenResponse.json();

    // Success redirect with tokens
    return NextResponse.redirect(
      createRedirectUrl('/dev/spotify', {
        success: 'true',
        refresh_token: refresh_token || '',
        access_token: access_token || ''
      })
    );

  } catch (error) {
    console.error('Error in Spotify callback:', error);
    return NextResponse.redirect(
      createRedirectUrl('/', { error: 'unknown_error' })
    );
  }
}```

## Testing Your OAuth Setup

To test your OAuth setup and easily generate tokens, visit the `/dev/spotify` page in your application. This interactive page provides:

- Step-by-step OAuth flow guidance
- Automatic generation of authorization URLs
- Token display with copy functionality
- Error handling and debugging information
- Environment variable requirements

Simply navigate to `http://127.0.0.1:3000/dev/spotify` after setting up your environment variables to test the complete OAuth flow.

---

## Making API Calls

Once you have your tokens, you can make authenticated requests to the Spotify API. Here's how to use the access token and refresh it when needed:

### Using the Access Token

```typescript
async function fetchSpotifyData(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  return await response.json();
}
```

### Refreshing the Access Token

Access tokens expire after 1 hour, so you'll need to refresh them using the refresh token:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
    }

    const authString = `${clientId}:${clientSecret}`;
    const base64Auth = Buffer.from(authString).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Auth}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        error: 'Token refresh failed',
        details: errorData.error_description || errorData.error
      }, { status: 400 });
    }

    const data = await response.json();

    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token || refresh_token // Spotify may return a new refresh token
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Common Pitfalls

### 1. Browser Caching Issues

Spotify's OAuth flow can get cached by browsers, especially during development. Use these strategies to avoid cache-related issues:

- Always use incognito/private browsing for testing
- Add `show_dialog=true` to force the consent screen
- Clear browser cookies and localStorage if needed

### 2. Mismatched Redirect URIs

This is the most common issue. The redirect URI in your code must exactly match what's registered in the Spotify Developer Dashboard:

- ✅ `http://127.0.0.1:3000/api/spotify/callback`
- ❌ `http://localhost:3000/api/spotify/callback`

### 3. Scope Issues

Make sure you request all necessary scopes upfront. Spotify doesn't allow incremental scope requests.

### 4. Token Storage

Never store tokens in client-side code or commit them to version control:

- ✅ Store refresh tokens securely on the server
- ✅ Use environment variables for client credentials
- ❌ Don't store tokens in localStorage or cookies

## Production Considerations

For production deployments:

1. **Use HTTPS**: All redirect URIs must use HTTPS in production
2. **Secure Storage**: Use a database or secure key management for refresh tokens
3. **Rate Limiting**: Implement rate limiting for your API endpoints
4. **Error Handling**: Provide user-friendly error messages
5. **Token Rotation**: Implement refresh token rotation for better security

## Complete Example

Here's a complete example of a Spotify API service:

```typescript
class SpotifyAPIService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async getCurrentlyPlaying(refreshToken: string): Promise<any> {
    const accessToken = await this.getAccessToken(refreshToken);

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204) {
      return null; // No track currently playing
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch currently playing: ${response.status}`);
    }

    return await response.json();
  }

  private async getAccessToken(refreshToken: string): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Refresh the token
    const response = await fetch('/api/spotify/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);

    return this.accessToken;
  }
}
```

## Conclusion

Setting up Spotify OAuth2 requires attention to detail, especially with redirect URIs and token management. The key takeaways are:

- Always use `127.0.0.1` instead of `localhost` for development
- Store refresh tokens securely and handle token expiration
- Implement proper error handling and user feedback
- Test thoroughly in different browsers and environments

With this setup, you can now integrate Spotify's rich API into your applications, from music players to analytics dashboards.

<NoticeInfo title="Next Steps">
Ready to build more? Check out my other guides on [API integration patterns](/blog/topics/api-integration) and [Next.js authentication](/blog/topics/auth).
</NoticeInfo>




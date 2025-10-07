# Contact Form Setup Guide

## Overview

The contact form is now fully implemented with:
- ✅ Frontend popover component with validation
- ✅ Backend API endpoint (`/api/contact`)
- ✅ Email service integration (Resend)
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback

## Setup Instructions

### 1. Get Resend API Key

1. Go to https://resend.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Give it a name (e.g., "remcostoeten.nl Contact Form")
6. Copy the API key (starts with `re_`)

### 2. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Resend API Key for sending emails
RESEND_API_KEY=re_your_actual_api_key_here

# Email address to receive contact form submissions
CONTACT_EMAIL=stoetenremco@gmail.com
```

You can add them using this command:

```bash
cd apps/frontend
echo "RESEND_API_KEY=re_your_actual_key_here" >> .env.local
echo "CONTACT_EMAIL=stoetenremco@gmail.com" >> .env.local
```

### 3. Verify Domain with Resend (Optional but Recommended)

For production, you should verify your domain to send emails from your own domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter `remcostoeten.nl`
4. Follow DNS setup instructions
5. Once verified, update the API route to use your domain:

```typescript
// In apps/frontend/src/app/api/contact/route.ts
from: 'Contact Form <contact@remcostoeten.nl>',
```

### 4. Test the Form

1. Start the development server:
```bash
cd apps/frontend
bun run dev
```

2. Navigate to http://localhost:3000
3. Scroll to the footer
4. Click "contact me here"
5. Fill out the form:
   - **Name**: Your name
   - **Contact info**: Email, Discord, etc.
   - **Message**: Your message (minimum 10 characters)
6. Click "Send message"
7. You should see a success toast and receive an email!

## How It Works

### Frontend (`contact-popover.tsx`)

- Collects user input (name, contact, message)
- Validates minimum requirements
- Shows loading state while sending
- Displays success/error toast notifications
- Clears form and closes popover on success

### Backend (`/api/contact/route.ts`)

- Validates input with Zod schema
- Checks for required environment variables
- Sends formatted HTML email via Resend
- Returns appropriate success/error responses
- Logs submission details

### Email Template

The email sent to you includes:
- Contact's name
- Their contact information (email, Discord, etc.)
- Their message
- Timestamp
- Source information (remcostoeten.nl)

## Troubleshooting

### "Email service is not configured" Error

**Problem**: `RESEND_API_KEY` is not set or invalid.

**Solution**:
1. Check `.env.local` has the key
2. Restart the dev server after adding environment variables
3. Verify the API key is valid in Resend dashboard

### "Failed to send email" Error

**Problem**: Resend API returned an error.

**Solution**:
1. Check console logs for detailed error
2. Verify API key has not been revoked
3. Check Resend dashboard for API usage/limits
4. Ensure you're not hitting rate limits (100 emails/day on free tier)

### Email Not Received

**Problem**: Email was sent but not received.

**Solution**:
1. Check spam folder
2. Verify `CONTACT_EMAIL` environment variable is correct
3. Check Resend dashboard **Logs** for delivery status
4. Consider verifying your domain for better deliverability

### Form Not Submitting

**Problem**: Button stays in "Sending..." state.

**Solution**:
1. Check browser console for errors
2. Verify `/api/contact` endpoint is accessible
3. Check network tab for failed requests
4. Ensure all required fields are filled

## Production Deployment

### Environment Variables

Add these to your production environment (Vercel, Netlify, etc.):

```bash
RESEND_API_KEY=re_your_production_key
CONTACT_EMAIL=stoetenremco@gmail.com
```

### Vercel Deployment

```bash
vercel env add RESEND_API_KEY
# Enter your API key when prompted

vercel env add CONTACT_EMAIL
# Enter your email when prompted
```

### Fly.io Deployment (if using)

```bash
flyctl secrets set RESEND_API_KEY=re_your_key --app your-app-name
flyctl secrets set CONTACT_EMAIL=stoetenremco@gmail.com --app your-app-name
```

## Rate Limits

### Resend Free Tier
- 100 emails per day
- 3,000 emails per month
- Good for personal portfolio sites

### Recommended Upgrades
If you exceed limits:
- **Pro**: $20/month - 50,000 emails/month
- **Business**: Custom pricing

## Security Notes

1. **API Key Protection**: Never commit `.env.local` to git (already in `.gitignore`)
2. **Input Validation**: All inputs are validated server-side with Zod
3. **Rate Limiting**: Consider adding rate limiting middleware in production
4. **Spam Protection**: Consider adding reCAPTCHA or similar in the future

## Future Enhancements

Potential improvements:
- [ ] Add reCAPTCHA for spam protection
- [ ] Add rate limiting per IP address
- [ ] Store submissions in database for backup
- [ ] Add auto-reply email to sender
- [ ] Add file attachment support
- [ ] Add Slack/Discord webhook integration

## Files Modified/Created

```
✅ apps/frontend/src/components/contact-popover.tsx      (updated)
✅ apps/frontend/src/app/api/contact/route.ts            (new)
✅ apps/frontend/src/app/layout.tsx                      (updated - added Toaster)
✅ apps/frontend/package.json                            (updated - added resend)
✅ apps/frontend/.env.local.example                      (new)
```

## Support

If you encounter issues:
1. Check Resend documentation: https://resend.com/docs
2. Check Next.js API routes docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
3. Review the error logs in your terminal

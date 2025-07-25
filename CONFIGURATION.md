# Site Configuration Guide

This guide explains how to configure your portfolio site using environment variables instead of hardcoded data.

## 🎯 Overview

The site has been refactored to eliminate hardcoded personal data and make it easily configurable for different users and environments. All personal information, social links, and site settings are now managed through environment variables.

## 📋 Required Configuration

### 1. Environment Variables

Copy `.env.example` to `.env.local` (for Next.js) or `.env` and configure the following:

#### Site Information
```env
NEXT_PUBLIC_SITE_TITLE="Your Portfolio Site"
NEXT_PUBLIC_SITE_DESCRIPTION="A modern portfolio website"
NEXT_PUBLIC_SITE_URL="https://yoursite.com"
```

#### Contact Information
```env
NEXT_PUBLIC_CONTACT_EMAIL="your.email@example.com"
```

#### Social Media Links
```env
NEXT_PUBLIC_SOCIAL_X="https://x.com/yourusername"
NEXT_PUBLIC_SOCIAL_GITHUB="https://github.com/yourusername"
NEXT_PUBLIC_SOCIAL_BEHANCE="https://behance.net/yourusername"
NEXT_PUBLIC_SOCIAL_TELEGRAM="https://t.me/yourusername"
```

#### Analytics Configuration
```env
VITE_ANALYTICS_PASSWORD="your-secure-password-here"
```

#### API Configuration
```env
ALLOWED_ORIGINS="http://localhost:3000,https://yoursite.com"
```

### 2. Database Content

The site now uses a sample data factory that:
- **Development**: Provides minimal sample data for testing
- **Production**: Uses only data from environment variables

#### Sample Data Behavior
- Projects: Empty in production (encourages database-driven approach)
- Skills: Empty in production 
- Experience: Empty in production
- Site Settings: Uses environment variables in all environments

## 🏗️ Architecture Changes

### Centralized Configuration
- **`src/config/site.ts`**: Central configuration hub
- **`src/data/sample-data-factory.ts`**: Environment-aware sample data
- **Updated seed files**: Use factory functions instead of hardcoded arrays

### Key Benefits
1. **Environment-specific**: Different behavior in dev vs production
2. **Secure**: No hardcoded passwords or personal info
3. **Flexible**: Easy to deploy for different users
4. **Maintainable**: Single source of truth for configuration

## 🚀 Deployment

### For Development
1. Copy `.env.example` to `.env.local`
2. Fill in your information
3. Run `npm run dev`

### For Production
1. Set environment variables in your hosting platform
2. Ensure `NODE_ENV=production` is set
3. Deploy

### Warning System
The site will show warnings for:
- Default analytics password (`change-me`)
- Default site URL (`https://example.com`)
- Default contact email (`contact@example.com`)

## 📊 Content Management

### Projects
- **Recommended**: Use the database and admin interface
- **Alternative**: Set `NEXT_PUBLIC_SIMPLE_PROJECTS` JSON array
- **Development**: Shows sample project for testing

### Skills & Experience
- Use database seeding with your own data
- Or implement admin interface for content management
- Development shows minimal sample data

### Site Settings
- Automatically populated from environment variables
- Updated through database seeding
- Always reflects current environment configuration

## 🔧 Customization

### Adding New Configuration
1. Add to `TSiteConfig` type in `src/config/site.ts`
2. Add environment variable handling
3. Update `.env.example`
4. Update this documentation

### Sample Data
Modify `src/data/sample-data-factory.ts` to change development sample data.

## 🔒 Security Notes

1. **Never commit `.env` files** containing real credentials
2. **Use strong passwords** for analytics
3. **Limit CORS origins** in production
4. **Use HTTPS** for production URLs

## 📚 Migration from Hardcoded Data

If migrating from the previous hardcoded version:

1. **Extract your data**: Copy your projects, skills, experience from old seed files
2. **Set environment variables**: Configure your site information
3. **Database seeding**: Use your real data instead of samples
4. **Test thoroughly**: Ensure all personal information appears correctly

## 🆘 Troubleshooting

### Configuration Warnings
Check browser console for configuration warnings and follow the provided instructions.

### Missing Data
- Ensure environment variables are set correctly
- Check that variable names match exactly (case-sensitive)
- Verify `.env.local` is in the correct location
- Restart development server after changing environment variables

### CORS Issues
- Update `ALLOWED_ORIGINS` to include your domain
- Ensure no trailing slashes in URLs
- Check browser network tab for specific CORS errors

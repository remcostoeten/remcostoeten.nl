# Deployment Guide - Vercel (Free Tier)

This guide explains how to deploy your React + Hono app with separate frontend and backend on Vercel's free tier.

## Architecture

- **Frontend**: Static Vite build deployed to Vercel
- **Backend**: Serverless functions with Hono API deployed to Vercel
- **Database**: PostgreSQL (Neon, Supabase, or Railway - all have free tiers)

## Prerequisites

1. Vercel account (free)
2. PostgreSQL database (recommendations below)
3. GitHub repository

## Database Setup

✅ **You already have both databases set up:**

### Local Development (Docker)
- **URL**: `postgresql://portfolio_user:portfolio_password@localhost:5433/portfolio_db`
- **Status**: Ready to use with `npm run db:up`

### Production (Neon)
- **URL**: Already configured in `.env.production`
- **Status**: Ready to deploy
- **Free tier**: 512MB storage

## Deployment Steps

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy Backend (API)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   POSTGRES_URL=your_postgresql_connection_string
   ADMIN_EMAIL=your-email@example.com
   ADMIN_PASSWORD=your-secure-password
   NODE_ENV=production
   ```

6. Deploy

Your API will be available at: `https://your-project.vercel.app/api`

### 3. Deploy Frontend (Separate Project)

Create a new Vercel project for just the frontend:

1. **Option A: Same Repository, Different Configuration**
   - Create `vercel-frontend.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "installCommand": "npm install"
   }
   ```

2. **Option B: Use Build Settings in Vercel Dashboard**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. Add Frontend Environment Variables:
   ```
   VITE_API_URL=https://your-api.vercel.app/api
   VITE_APP_ENV=production
   ```

### 4. Update CORS Configuration

Update your API's CORS settings to include your frontend URL:

```typescript
// In api/index.ts
app.use('/*', cors({
  origin: [
    'http://localhost:3333',
    'http://localhost:5173', 
    'https://your-frontend.vercel.app' // Add your frontend URL
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5. Database Migration

Run database migrations after deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations (if you have them)
vercel exec -- npm run db:push
```

## Testing Deployment

1. **Test API**: Visit `https://your-api.vercel.app/api/health`
2. **Test Frontend**: Visit `https://your-frontend.vercel.app`
3. **Test Integration**: Check if frontend can connect to backend

## Custom Domains (Optional)

### Backend API
1. Go to Vercel dashboard > Your API project > Domains
2. Add custom domain: `api.yourdomain.com`

### Frontend
1. Go to Vercel dashboard > Your frontend project > Domains  
2. Add custom domain: `yourdomain.com`

## Environment Management

### Development
```bash
cp .env.example .env.local
# Fill in your local database credentials
```

### Production
- Set environment variables in Vercel dashboard
- Never commit secrets to git

## Free Tier Limits

**Vercel Free Tier:**
- 100GB bandwidth/month
- 6000 build minutes/month
- 100 serverless function executions/day
- 10 second function timeout

**Database Free Tiers:**
- Neon: 512MB storage, 1 compute hour/month
- Supabase: 500MB storage, unlimited requests
- Railway: 5GB storage, 500 hours runtime (trial)

## Monitoring

1. **Vercel Analytics**: Enable in dashboard for traffic insights
2. **Function Logs**: View in Vercel dashboard > Functions tab
3. **Database Monitoring**: Use your database provider's dashboard

## Troubleshooting

### Common Issues

1. **API not working**: Check environment variables are set
2. **CORS errors**: Ensure frontend URL is in CORS allowlist
3. **Database connection**: Verify connection string format
4. **Build failures**: Check build logs in Vercel dashboard

### Debug Commands

```bash
# Test local build
npm run build

# Test API locally
npm run dev:api

# Check environment variables
vercel env ls

# View function logs
vercel logs
```

## Cost Optimization

1. **Database**: Use connection pooling
2. **Functions**: Optimize cold starts
3. **Frontend**: Enable compression and caching
4. **Images**: Use Vercel Image Optimization

## Scaling Beyond Free Tier

When you outgrow free tier:
1. **Vercel Pro**: $20/month - more bandwidth, faster builds
2. **Database**: Upgrade to paid plans for more storage
3. **CDN**: Consider additional CDN for global performance

This setup should handle moderate traffic completely free! 🚀

# Analytics Authentication

Your analytics dashboard is now protected with password authentication.

## 🔒 Current Setup

- **Default Password**: `admin123` 
- **Dashboard URL**: `/analytics`
- **Session Duration**: 24 hours
- **Max Login Attempts**: 5 (15-minute lockout after)

## ⚠️ Important: Change Default Password

**For security, immediately change the default password:**

### Option 1: Environment Variable (Recommended)
```bash
# Add to your .env file
VITE_ANALYTICS_PASSWORD=your-secure-password-here
```

### Option 2: Direct Configuration
Edit `src/config/analytics.ts`:
```typescript
ADMIN_PASSWORD: 'your-secure-password-here'
```

## 🚀 Quick Start

1. **Change the password** (see above)
2. **Visit** `http://localhost:8080/analytics`
3. **Login** with your password
4. **Access** the protected dashboard

## 🛡️ Security Features

- **Password Protection**: Only you can access analytics
- **Session Management**: Auto-logout after 24 hours
- **Brute Force Protection**: Temporary lockout after failed attempts
- **Security Warnings**: Shows if using default password

## 📋 Commands

```bash
# Set up analytics (includes auth)
npm run analytics:setup

# Start analytics system
npm run analytics:start

# View dashboard location
npm run analytics:dashboard
```

The dashboard is now secure and only accessible to you!

# Remco Stoeten - Personal Blog & Analytics

A modern, self-hosted blog and analytics system built with Next.js, Hono.js, and PostgreSQL.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with MDX support, TailwindCSS, and custom components
- **Backend**: Hono.js API with PostgreSQL database and real-time analytics
- **Content**: MDX-based blog posts with automated metadata sync
- **Analytics**: Custom visitor tracking and pageview analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Bun (for backend)
- PostgreSQL database (optional - falls back to memory storage)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd remcostoeten.nl/apps

# Install all dependencies
npm run install:all

# Set up blog automation
npm run blog:hooks

# Start development servers
npm run dev
```

### Environment Setup

#### Backend (.env in `backend/` directory)
```bash
# Storage Configuration
STORAGE_TYPE=database  # or 'memory' for development

# PostgreSQL Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database_name"

# Server Configuration
PORT=4001
```

#### Frontend (.env.local in `frontend/` directory)
```bash
# Backend API URL
NEXT_PUBLIC_API_BASE=http://localhost:4001/api
```

## 📋 Available Commands

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend (port 3000)
npm run dev:backend      # Start only backend (port 4001)
```

### Building
```bash
npm run build            # Build both applications
npm run build:frontend   # Build only frontend
npm run build:backend    # Build only backend
```

### Production
```bash
npm run start            # Start both applications in production
npm run start:frontend   # Start only frontend in production
npm run start:backend    # Start only backend in production
```

### Blog Management
```bash
npm run blog:sync        # Sync blog metadata with backend
npm run blog:list        # List all blog posts
npm run blog:create      # Create a new blog post
npm run blog:watch       # Watch for MDX changes and auto-sync
npm run blog:hooks       # Set up Git hooks for automation
```

### Utilities
```bash
npm run clean            # Clean all build artifacts and node_modules
npm run setup            # Complete setup (install + blog hooks)
```

## 📁 Project Structure

```
apps/
├── frontend/                    # Next.js frontend application
│   ├── content/blog/           # MDX blog posts
│   ├── scripts/                # Blog automation scripts
│   ├── src/                    # Next.js source code
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and configurations
│   │   └── modules/           # Feature modules
│   └── package.json           # Frontend dependencies
├── backend/                    # Hono.js backend API
│   ├── src/                   # Backend source code
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── schema/            # Database schemas
│   │   └── db/                # Database configuration
│   └── package.json           # Backend dependencies
└── package.json               # Monorepo configuration
```

## 🔧 Blog System

### Creating Blog Posts
1. Create a new `.mdx` file in `frontend/content/blog/`
2. Add frontmatter with required fields:
   ```yaml
   ---
   title: "Your Blog Post Title"
   excerpt: "Brief description of the post"
   publishedAt: "2024-01-15"
   tags: ["React", "TypeScript", "Frontend"]
   category: "development"
   status: "published"
   author: "Your Name"
   ---
   ```
3. The automation system will sync metadata automatically

### Blog Automation
- **File Watcher**: Automatically syncs metadata when MDX files change
- **Git Hooks**: Syncs metadata on commits
- **GitHub Actions**: Validates sync in CI/CD
- **VS Code Tasks**: Quick access to blog commands

## 📊 Analytics System

### Features
- **Visitor Tracking**: Unique visitor identification with fingerprinting
- **Pageview Analytics**: Track page views with metadata
- **Blog Analytics**: Specific analytics for blog posts
- **Real-time Dashboard**: Live analytics at `/analytics`

### Storage Options
- **Database**: PostgreSQL for persistent storage (production)
- **Memory**: In-memory storage for development (data lost on restart)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build:frontend
# Deploy the frontend/out directory
```

### Backend (Railway/Render/DigitalOcean)
```bash
npm run build:backend
# Deploy with environment variables configured
```

### Environment Variables for Production
- Set `DATABASE_URL` for persistent analytics
- Configure `NEXT_PUBLIC_API_BASE` to point to your backend
- Set up proper CORS origins in backend

## 🛠️ Development

### Adding New Features
1. Create feature modules in `frontend/src/modules/`
2. Add API routes in `backend/src/routes/`
3. Update database schema if needed
4. Add tests and documentation

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Custom components over external libraries
- Kebab-case file naming
- Self-documenting code (minimal comments)

## 📚 Documentation

- [Blog System Guide](frontend/BLOG_SYSTEM.md)
- [Blog Features](frontend/BLOG_FEATURES.md)
- [Blog Automation](frontend/BLOG_AUTOMATION.md)
- [Database Setup](backend/setup-database.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ by Remco Stoeten**

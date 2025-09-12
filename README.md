# Monorepo - Blog Platform

A full-stack blog platform with a Next.js frontend and Hono.js backend for analytics.

## Architecture

```
├── apps/
│   ├── frontend/        # Next.js blog application
│   └── backend/         # Hono.js API for pageview tracking
├── package.json         # Root workspace configuration
└── README.md           # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- Bun (for backend)
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

### Production

```bash
# Build both applications
npm run build

# Clean all build artifacts
npm run clean
```

## Applications

### Frontend (`apps/frontend`)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Port**: 3000

### Backend (`apps/backend`)
- **Framework**: Hono.js
- **Language**: TypeScript
- **Runtime**: Bun
- **Port**: 3001

## API Endpoints

### Pageviews API
- `POST /api/pageviews` - Track a pageview
- `GET /api/pageviews` - Get pageviews with filtering
- `GET /api/pageviews/stats` - Get analytics statistics
- `GET /health` - Health check

## Features

- 📝 Blog post management
- 📊 Pageview analytics
- 🎨 Modern UI with smooth animations
- 📱 Responsive design
- 🔒 Type-safe with TypeScript
- ⚡ Fast development with hot reload
- 🚀 Production-ready builds

## Development Workflow

1. Make changes to either frontend or backend
2. Both applications will hot-reload automatically
3. Frontend can consume backend APIs at `http://localhost:3001`
4. Use `npm run build` to create production builds

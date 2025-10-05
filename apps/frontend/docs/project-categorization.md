# Project Categorization System

## Overview

The projects section is organized into three main categories with specific project assignments and display counts.

## Categories

### APIs (Show All - 3 projects)
Backend services, REST APIs, and server-side applications:
- **fync** - Fetch wrapper library
- **drizzleasy** - Database utilities 
- **hono-analytics** - Analytics service built with Hono

### DX tooling (Show 4 out of 5)
Developer tools, utilities, and workflow improvements:
- **Hygienic** - Code quality tool
- **Docki** - Docker development utility
- **Turso-db-creator-auto-retrieve-env-credentials** - Database setup automation
- **gh-select** - GitHub repository selection tool
- **dotfiles** - Development environment configuration

### Projects (Show 4 out of 6)
Frontend applications, websites, and complete solutions:
- **remcostoeten.nl** - Personal portfolio website
- **expense-calendar** - Expense tracking calendar application
- **nextjs-15-roll-your-own-authentication** - Authentication implementation example
- **emoji-feedback-widget** - Interactive feedback widget component
- **The most beautifull file tree** - File tree component (@https://beautiful-file-tree-v2.vercel.app/)
- **The most beautifull code block** - Code block component (@https://react-beautiful-featurerich-codeblo.vercel.app/)

## Implementation Details

### Files Modified
1. `/services/github-service.ts` - Updated to fetch all specified repositories
2. `/modules/projects/utils/categorize-project.ts` - Added explicit project categorization mapping
3. `/modules/projects/components/CategorizedProjects.tsx` - Updated display logic for per-category item counts

### Display Logic
- **APIs**: Shows all projects (no "show more" needed as there are only 3)
- **DX tooling**: Shows 4 initially, with option to expand for the 5th
- **Projects**: Shows 4 initially, with option to expand for remaining 2

The system uses explicit mapping for consistent categorization and falls back to automatic categorization for unknown projects.
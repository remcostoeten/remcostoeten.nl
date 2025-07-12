# remcostoeten.nl

A Next.js portfolio and CMS application built with TypeScript, Tailwind CSS, and Drizzle ORM.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- SQLite database

### Installation

1. Clone the repository
2. Install dependencies:
```bash
bun install
```

3. Create a `.env.local` file with required environment variables (see [Environment Variables](#environment-variables) section)

4. Run the development server:
```bash
bun run dev
```

## Environment Variables

### Client-Side Variables

**IMPORTANT**: Client-side environment variables in Next.js must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

### Admin Toggle Feature

The admin CMS interface is controlled by the `NEXT_PUBLIC_ADMIN_TOGGLE` environment variable.

**Setup**: Add the following to your `.env.local` file:
```env
NEXT_PUBLIC_ADMIN_TOGGLE="true"
```

**Security  Safety Notes**:
- The value must be exactly the string `"true"` (including quotes) for the feature to be active
- Any other value (including `true`, `"false"`, `1`, `0`, empty string, or undefined) will render the feature inert
- This strict string matching provides an additional safety layer to prevent accidental exposure of admin functionality
- Since this is a client-side variable, it will be visible in the browser - ensure you understand the security implications for your use case

**Examples**:
```env
# ✅ ACTIVE - Admin feature enabled
NEXT_PUBLIC_ADMIN_TOGGLE="true"

# ❌ INACTIVE - All other values disable the feature
NEXT_PUBLIC_ADMIN_TOGGLE=true
NEXT_PUBLIC_ADMIN_TOGGLE="false"
NEXT_PUBLIC_ADMIN_TOGGLE="1"
NEXT_PUBLIC_ADMIN_TOGGLE=""
# NEXT_PUBLIC_ADMIN_TOGGLE not set
```

### Authentication Variables

Add the following to your `.env.local` file for authentication setup:

```env
AUTH_SECRET="your-secret-key-here-generate-a-random-32-character-string"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Database Configuration
DATABASE_URL="file:local.db"
TURSO_AUTH_TOKEN="your-turso-auth-token-if-using-turso"
```

#### Required Authentication Variables

**AUTH_SECRET** (Required)
- A random 32-character string used to sign JWT tokens
- Generate one using: `openssl rand -hex 32` or an online generator
- Keep this secret and never commit it to version control

**GITHUB_CLIENT_ID** and **GITHUB_CLIENT_SECRET** (Required for GitHub OAuth)
- Create a GitHub OAuth App at: https://github.com/settings/developers
- Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
- Copy the Client ID and Client Secret from your GitHub OAuth App

**NEXT_PUBLIC_BETTER_AUTH_URL** (Optional)
- The base URL for Better Auth API calls
- Defaults to `http://localhost:3000` for local development
- Set to your production domain for deployed environments

**DATABASE_URL** (Required)
- For local development: `file:local.db` (SQLite)
- For Turso: Your Turso database URL

**TURSO_AUTH_TOKEN** (Optional)
- Only required if using Turso as your database provider
- Get this from your Turso dashboard

#### Email/Password Authentication

Better Auth handles email/password authentication automatically with secure defaults:
- Passwords are hashed using bcrypt
- No additional salt configuration is required
- The library handles all security aspects internally

Ensure to replace placeholder values with the actual credentials.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── admin/cms/      # Admin CMS interface
│   ├── api/cms/        # CMS API routes
│   └── ...
├── components/         # Reusable React components
│   ├── cms/           # CMS-specific components
│   └── ui/            # UI components
├── db/                # Database schema and utilities
├── lib/               # Utility libraries
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Database

This project uses Drizzle ORM with SQLite.

### Available Commands

- `bun run db:push` - Push schema changes to database
- `bun run db:pull` - Pull schema from database
- `bun run db:generate` - Generate migrations
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:seed` - Seed the database

## Development

### Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

### CMS Features

- Inline page editing
- Block-based content management
- Real-time preview
- Keyboard shortcuts (Cmd+N: New Page, Cmd+S: Save, Esc: Back)

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Drizzle ORM
- **UI Components**: Radix UI primitives
- **State Management**: React hooks and context
- **Authentication**: Better Auth
- **Package Manager**: Bun

## Contributing

1. Follow the existing code style and patterns
2. Use kebab-case for file names
3. Prefer pure functions over classes
4. Use proper TypeScript types
5. Test your changes thoroughly

## License

Private project - All rights reserved.

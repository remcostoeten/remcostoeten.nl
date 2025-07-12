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

3. Set up environment variables (see [Environment Variables](#environment-variables) section)

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

**Security & Safety Notes**:
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

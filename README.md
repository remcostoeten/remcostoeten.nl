[![Build Status](https://github.com/remcostoeten/remcostoeten.nl/actions/workflows/ci.yml/badge.svg)](https://github.com/remcostoeten/remcostoeten.nl/actions)
[![Coverage Status](https://codecov.io/gh/remcostoeten/remcostoeten.nl/branch/main/graph/badge.svg)](https://codecov.io/gh/remcostoeten/remcostoeten.nl)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/remcostoeten/remcostoeten.nl/releases)

## remcostoeten.nl

My personal site. After about 50 iterations over the past few years, I've come to the conclusion
that minimalism is the way to go for personal websites.

From an engineering perspective, I may have over-engineered it a little—but that's never hurt
anyone, right?

Both the front-end and back-end are built with Next.js for confidence.  
**Back-end?** For those couple of paragraphs on the front page?  
Yes. I could’ve finished this site in a few hours, but I chose to roll my own CMS—because why not?

It's protected by [nextjs-15-roll-your-own-authentication](https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication),
which I also built from scratch.

The front-end includes a small survey/contact form (accessible via the contact link), which
displays inside the CMS.

I'm also in the process of building my own analytics system with a long-term goal of releasing
an SDK. This data will also be queried and displayed inside the CMS/admin panel.

Lastly—and maybe the best part—is [Fync](https://github.com/remcostoeten/fync), a package that
provides most of the methods you'd need when working with the GitHub and Spotify APIs. It's still
under construction, and I plan to add support for additional providers like GitLab, Notion, Vercel,
Jira, and more.

_Someday I’ll insert a video demo of the CMS here._

### Stack

- Next.js 15 / React 19
- LibSQL (SQLite via Turso) with API routes
- `jose` (JWT), `bcrypt` (encryption), `drizzle` (ORM),
  [`fync`](https://github.com/remcostoeten/fync) (GitHub & Spotify API provider)

### CLI Usage Examples

#### Development Commands

```bash
# Start development server
pnpm dev

# Start production server
pnpm start

# Start with specific user (if CLI user flag is implemented)
pnpm start --user myUser

# Build the application
pnpm build
```

#### Database Commands

```bash
# Push database schema changes
pnpm push

# Generate database migrations
pnpm gen

# Open Drizzle Studio
pnpm studio

# Seed home page content
pnpm seed:home
```

#### GitHub API Commands

```bash
# Query latest commit with GitHub token
GH_TOKEN=ghp_your_token_here node dist/index.js

# Alternative using environment file
echo "GH_TOKEN=ghp_your_token_here" > .env.local
node dist/index.js
```

#### Expected Output - Latest Commit Query

When querying for the latest commit, you can expect output similar to:

```json
{
  "repository": "remcostoeten/remcostoeten.nl",
  "commit": {
    "sha": "a1b2c3d4e5f6789012345678901234567890abcd",
    "message": "feat: add CLI usage documentation",
    "author": {
      "name": "Remco Stoeten",
      "email": "remco@example.com"
    },
    "date": "2024-01-15T10:30:00Z",
    "url": "https://github.com/remcostoeten/remcostoeten.nl/commit/a1b2c3d4e5f6789012345678901234567890abcd"
  }
}
```

**Key highlights:**
- **Repository**: Full repository path (owner/repo)
- **SHA**: Complete commit hash (40 characters)
- **Date**: ISO 8601 timestamp in UTC
- **Author**: Commit author information
- **Message**: Commit message
- **URL**: Direct link to the commit on GitHub

#### Code Quality Commands

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check and fix code issues
pnpm check
```

xxx,

Remco stoeten

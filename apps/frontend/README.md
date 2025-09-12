# Frontend - Next.js Blog

A modern Next.js blog application with a beautiful UI and smooth animations.

## Features

- Modern Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui components
- Responsive design
- Smooth animations and transitions
- Blog post management
- Newsletter subscription
- User profile section

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── blog/           # Blog-related components
│   ├── navigation/     # Navigation components
│   ├── ui/             # Shadcn/ui components
│   └── ...
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and data
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

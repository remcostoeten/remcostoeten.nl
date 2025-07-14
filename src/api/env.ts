import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
	server: {
		// Database
		TURSO_DATABASE_URL: z.string(),
		TURSO_AUTH_TOKEN: z.string(),

		// Authentication
		JWT_SECRET: z.string().min(32),
		ADMIN_EMAIL: z.string().email(),

		// Node Environment
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),

		// GitHub OAuth
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),

		// Google OAuth
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),

		// Spotify API (Optional)
		SPOTIFY_CLIENT_ID: z.string().optional(),
		SPOTIFY_CLIENT_SECRET: z.string().optional(),
		SPOTIFY_REFRESH_TOKEN: z.string().optional(),

		// Better Auth (Optional)
		AUTH_SECRET: z.string().optional()
	},
	client: {
		// Public App URL
		NEXT_PUBLIC_APP_URL: z.string().url(),

		// Admin Toggle
		NEXT_PUBLIC_ADMIN_TOGGLE: z.string().optional(),

		// Better Auth URL (Optional)
		NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),

		// Spotify API URL (Optional)
		NEXT_PUBLIC_SPOTIFY_API_URL: z.string().url().optional()
	},
	runtimeEnv: {
		// Server variables (Required)
		TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
		TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
		JWT_SECRET: process.env.JWT_SECRET,
		ADMIN_EMAIL: process.env.ADMIN_EMAIL,
		NODE_ENV: process.env.NODE_ENV || 'development',
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

		// Server variables (Optional)
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || undefined,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || undefined,
		SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN || undefined,
		AUTH_SECRET: process.env.AUTH_SECRET || undefined,

		// Client variables (Required)
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

		// Client variables (Optional)
		NEXT_PUBLIC_ADMIN_TOGGLE:
			process.env.NEXT_PUBLIC_ADMIN_TOGGLE || undefined,
		NEXT_PUBLIC_BETTER_AUTH_URL:
			process.env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined,
		NEXT_PUBLIC_SPOTIFY_API_URL:
			process.env.NEXT_PUBLIC_SPOTIFY_API_URL || undefined
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION
})

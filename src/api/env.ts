import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		// Database
		TURSO_DATABASE_URL: z.string(),
		TURSO_AUTH_TOKEN: z.string(),

		// Authentication
		JWT_SECRET: z.string().min(32),
		ADMIN_EMAIL: z.string().email(),
		TEST_USER_EMAIL: z.string().email().optional(),
		TEST_USER_PASSWORD: z.string().optional(),

		// Node Environment
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),

		// Spotify API (Optional)
		SPOTIFY_CLIENT_ID: z.string().optional(),
		SPOTIFY_CLIENT_SECRET: z.string().optional(),
		SPOTIFY_REFRESH_TOKEN: z.string().optional(),
	},
	client: {
		// Public App URL
		NEXT_PUBLIC_APP_URL: z.string().url(),

		// Admin Toggle
		NEXT_PUBLIC_ADMIN_TOGGLE: z.string().optional(),

		// Spotify API URL (Optional)
		NEXT_PUBLIC_SPOTIFY_API_URL: z.string().url().optional(),
	},
	runtimeEnv: {
		// Server variables (Required)
		TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
		TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
		JWT_SECRET: process.env.JWT_SECRET,
		ADMIN_EMAIL: process.env.ADMIN_EMAIL,
		TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || undefined,
		TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || undefined,
		NODE_ENV: process.env.NODE_ENV || "development",

		// Server variables (Optional)
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || undefined,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || undefined,
		SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN || undefined,

		// Client variables (Required)
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

		// Client variables (Optional)
		NEXT_PUBLIC_ADMIN_TOGGLE: process.env.NEXT_PUBLIC_ADMIN_TOGGLE || undefined,
		NEXT_PUBLIC_SPOTIFY_API_URL:
			process.env.NEXT_PUBLIC_SPOTIFY_API_URL || undefined,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

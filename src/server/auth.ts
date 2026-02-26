import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from 'db'
import { env } from 'env'
import * as authSchema from './db/auth-schema'

export type ProviderKey = 'github' | 'google'

type ProviderConfig = {
	clientId: string
	clientSecret: string
}

function buildProviders(): Partial<Record<ProviderKey, ProviderConfig>> {
	const providers: Partial<Record<ProviderKey, ProviderConfig>> = {}

	if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
		providers.github = {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		}
	}

	if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
		providers.google = {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	}

	return providers
}

const socialProviders = buildProviders()

export function listProviders(): ProviderKey[] {
	return Object.keys(socialProviders) as ProviderKey[]
}

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: authSchema
	}),
	trustedOrigins: [
		env.BETTER_AUTH_URL,
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002'
	],
	session: {
		// Keep sessions persistent across browser/tab restarts for admin workflows.
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24
	},
	socialProviders,
	plugins: [admin()]
})

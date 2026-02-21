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

	console.log('[Auth] Building providers...')

	if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
		console.log('[Auth] GitHub provider configured')
		providers.github = {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		}
	} else {
		console.log('[Auth] GitHub provider configuration MISSING', {
			hasClientId: !!env.GITHUB_CLIENT_ID,
			hasClientSecret: !!env.GITHUB_CLIENT_SECRET
		})
	}

	if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
		console.log('[Auth] Google provider configured')
		providers.google = {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	} else {
		console.log('[Auth] Google provider configuration MISSING', {
			hasClientId: !!env.GOOGLE_CLIENT_ID,
			hasClientSecret: !!env.GOOGLE_CLIENT_SECRET
		})
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
	socialProviders,
	plugins: [admin()]
})

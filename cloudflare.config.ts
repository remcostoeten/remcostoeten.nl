import { bindings, defineConfig, defineWorker, triggers } from 'cf/config'
import { createWorkersResponseStoreSelfContainedConfig } from '@vinext/cloudflare/cache/config'

const WORKER_NAME = 'remcostoeten-nl'

const responseStore = await createWorkersResponseStoreSelfContainedConfig({
	worker: WORKER_NAME,
	bucket: 'remcostoeten-nl-response-store'
})

export default defineConfig({
	worker: defineWorker({
		name: WORKER_NAME,
		...responseStore,
		entrypoint: './worker/index.ts',
		compatibilityDate: '2026-10-18',
		compatibilityFlags: ['nodejs_compat'],
		observability: {
			enabled: true
		},
		domains: [
			'remcostoeten.nl',
			'www.remcostoeten.nl',
			'remcostoeten.com',
			'www.remcostoeten.com'
		],
		triggers: [triggers.scheduled({ schedule: '17 * * * *' })],
		assets: {
			htmlHandling: 'none',
			notFoundHandling: 'none',
			runWorkerFirst: [
				'/*',
				'!/_next/static/*',
				'!/*/_next/static/*',
				'!/images/*',
				'!/projects/*',
				'!/logos/*',
				'!/icons/*',
				'!/*.mp4',
				'!/*.webm'
			]
		},
		env: {
			...responseStore.env,
			ASSETS: bindings.assets(),
			DATABASE_URL: bindings.secret(),
			BETTER_AUTH_URL: bindings.secret(),
			BETTER_AUTH_SECRET: bindings.secret(),
			ADMIN_EMAIL: bindings.secret(),
			GITHUB_CLIENT_ID: bindings.secret(),
			GITHUB_CLIENT_SECRET: bindings.secret(),
			GITHUB_TOKEN: bindings.secret(),
			GOOGLE_CLIENT_ID: bindings.secret(),
			GOOGLE_CLIENT_SECRET: bindings.secret(),
			GROQ_API_KEY: bindings.secret(),
			IP_INFO_TOKEN: bindings.secret(),
			SPOTIFY_CLIENT_ID: bindings.secret(),
			SPOTIFY_CLIENT_SECRET: bindings.secret(),
			SPOTIFY_REDIRECT_URI: bindings.secret(),
			SPOTIFY_REFRESH_TOKEN: bindings.secret(),
			CRON_SECRET: bindings.secret(),
			RA_SECRET: bindings.secret()
		}
	})
})

import { bindings, defineConfig, defineWorker } from 'cf/config'

export default defineConfig({
	worker: defineWorker({
		name: 'remcostoeten-nl',
		entrypoint: 'vinext/server/fetch-handler',
		compatibilityDate: '2026-10-18',
		compatibilityFlags: ['nodejs_compat'],
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
			ASSETS: bindings.assets(),
			VINEXT_KV_CACHE: bindings.kv(),
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

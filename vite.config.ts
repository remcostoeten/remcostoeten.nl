import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vinext from 'vinext'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^@\/features\/blog\/lib\/posts-source$/,
				replacement: fileURLToPath(
					new URL(
						'./src/features/blog/lib/posts-source.vite.ts',
						import.meta.url
					)
				)
			}
		]
	},
	build: {
		sourcemap: false
	},
	plugins: [
		vinext({
			react: { compiler: true }
		}),
		cloudflare({
			viteEnvironment: {
				name: 'rsc',
				childEnvironments: ['ssr']
			}
		})
	]
})

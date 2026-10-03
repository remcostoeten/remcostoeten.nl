import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		tsconfigPaths: true
	},
	test: {
		environment: 'node',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		env: {
			DATABASE_URL: 'postgresql://localhost/test',
			BETTER_AUTH_URL: 'http://localhost:3000',
			BETTER_AUTH_SECRET: 'test-secret'
		},
		include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx']
		}
	}
})

import { afterEach, beforeEach, vi } from 'vitest'

const requiredTestEnv = {
	DATABASE_URL: 'postgres://test:test@localhost:5432/test',
	BETTER_AUTH_URL: 'http://localhost:3000',
	BETTER_AUTH_SECRET: 'test-secret'
}

for (const [key, value] of Object.entries(requiredTestEnv)) {
	process.env[key] ??= value
}

beforeEach(() => {
	vi.useRealTimers()
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
})

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('AppProviders first-load chrome', () => {
	it('keeps optional app chrome out of the root provider module', () => {
		const providers = readFileSync(
			'src/components/providers/providers.tsx',
			'utf8'
		)

		expect(providers).not.toContain('@/components/theme-switch')
		expect(providers).not.toContain('@/components/auth/vim-auth-provider')
		expect(providers).not.toContain('@/core/analytics')
		expect(providers).not.toContain('sonner')
	})
})

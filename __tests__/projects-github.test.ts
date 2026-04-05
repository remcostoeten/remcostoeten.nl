import { beforeEach, describe, expect, it, vi } from 'vitest'

const githubAuthMocks = vi.hoisted(() => ({
	getGitHubToken: vi.fn()
}))

vi.mock('@/server/github', () => githubAuthMocks)

describe('project github enrichment', () => {
	beforeEach(() => {
		vi.resetModules()
		vi.unstubAllEnvs()
		vi.unstubAllGlobals()
		githubAuthMocks.getGitHubToken.mockReset()
	})

	it('skips live github enrichment during production builds', async () => {
		vi.stubEnv('NEXT_PHASE', 'phase-production-build')
		const fetchSpy = vi.fn()
		vi.stubGlobal('fetch', fetchSpy)

		const { enrichProjectsWithGitData } = await import('@/components/projects/server/github')
		const projects = [
			{
				name: 'Project one',
				github: 'https://github.com/remcostoeten/remcostoeten.nl'
			}
		]

		const result = await enrichProjectsWithGitData(projects)

		expect(result).toEqual(projects)
		expect(fetchSpy).not.toHaveBeenCalled()
	})
})

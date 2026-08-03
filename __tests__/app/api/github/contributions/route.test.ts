import { beforeEach, describe, expect, it, vi } from 'vitest'

const githubMocks = vi.hoisted(() => ({
	getDailyContributions: vi.fn()
}))

vi.mock('@/server/github', () => ({
	githubService: githubMocks
}))

describe('github contributions route', () => {
	beforeEach(() => {
		vi.resetModules()
		githubMocks.getDailyContributions.mockReset()
	})

	it('rejects malformed years before calling the github service', async () => {
		const { GET } = await import('@/app/api/github/contributions/route')
		const response = await GET(
			new Request(
				'http://localhost:3000/api/github/contributions?year=2026abc'
			)
		)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({
			error: 'Year parameter must be between 2008 and the current year'
		})
		expect(githubMocks.getDailyContributions).not.toHaveBeenCalled()
	})

	it('returns yearly contribution data for a valid year', async () => {
		githubMocks.getDailyContributions.mockResolvedValue(
			new Map([['2026-03-30', { contributionCount: 3 }]])
		)

		const { GET } = await import('@/app/api/github/contributions/route')
		const response = await GET(
			new Request(
				'http://localhost:3000/api/github/contributions?year=2026'
			)
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(githubMocks.getDailyContributions).toHaveBeenCalledWith(2026)
		expect(data).toEqual([
			{
				date: '2026-03-30',
				data: { contributionCount: 3 }
			}
		])
	})
})

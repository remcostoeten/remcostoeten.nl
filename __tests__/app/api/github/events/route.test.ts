import { beforeEach, describe, expect, it, vi } from 'vitest'

const githubMocks = vi.hoisted(() => ({
	getDetailedEvents: vi.fn()
}))

vi.mock('@/server/github', () => ({
	githubService: githubMocks
}))

describe('github events route', () => {
	beforeEach(() => {
		vi.resetModules()
		githubMocks.getDetailedEvents.mockReset()
	})

	it('rejects malformed dates before calling the github service', async () => {
		const { GET } = await import('@/app/api/github/events/route')
		const response = await GET(
			new Request(
				'http://localhost:3000/api/github/events?date=2026-02-31'
			)
		)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({
			error: 'Date parameter must use YYYY-MM-DD'
		})
		expect(githubMocks.getDetailedEvents).not.toHaveBeenCalled()
	})

	it('returns events for a valid date', async () => {
		githubMocks.getDetailedEvents.mockResolvedValue([
			{ events: [{ id: 'event-1' }] }
		])

		const { GET } = await import('@/app/api/github/events/route')
		const response = await GET(
			new Request(
				'http://localhost:3000/api/github/events?date=2026-03-30'
			)
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(githubMocks.getDetailedEvents).toHaveBeenCalledWith(
			'2026-03-30',
			'2026-03-30'
		)
		expect(data).toEqual({ events: [{ id: 'event-1' }] })
	})
})

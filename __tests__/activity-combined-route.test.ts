import { beforeEach, describe, expect, it, vi } from 'vitest'

const combinedMocks = vi.hoisted(() => ({
	getCombinedActivity: vi.fn()
}))

vi.mock('@/app/api/activity/combined/combine', () => combinedMocks)

describe('activity combined route', () => {
	beforeEach(() => {
		vi.resetModules()
		combinedMocks.getCombinedActivity.mockReset()
	})

	it('clamps public query params before calling the aggregator', async () => {
		combinedMocks.getCombinedActivity.mockResolvedValue({
			fetchedAt: 123
		})

		const { GET } = await import('@/app/api/activity/combined/route')
		const response = await GET(
			new Request(
				'http://localhost:3000/api/activity/combined?activityLimit=999&tracksLimit=0'
			)
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(combinedMocks.getCombinedActivity).toHaveBeenCalledWith(25, 1)
		expect(data).toEqual({ fetchedAt: 123 })
	})
})

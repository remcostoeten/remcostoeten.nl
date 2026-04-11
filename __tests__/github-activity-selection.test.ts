import { describe, expect, it } from 'vitest'
import type { GitHubEventDetail } from '@/features/github/types'
import { selectDistinctRecentActivity } from '@/server/github/service'

function createActivity(
	id: string,
	repository: string,
	timestamp: string
): GitHubEventDetail {
	return {
		id,
		type: 'commit',
		title: 'updated code',
		description: 'latest change',
		url: `https://github.com/${repository}`,
		repository,
		timestamp,
		isPrivate: false
	}
}

describe('selectDistinctRecentActivity', () => {
	it('returns the latest event for each repository in recency order', () => {
		const events = [
			createActivity('1', 'owner/app-a', '2026-04-08T12:00:00.000Z'),
			createActivity('2', 'owner/app-a', '2026-04-08T11:00:00.000Z'),
			createActivity('3', 'owner/app-b', '2026-04-08T10:00:00.000Z'),
			createActivity('4', 'owner/app-c', '2026-04-08T09:00:00.000Z')
		]

		expect(selectDistinctRecentActivity(events, 3)).toEqual([
			events[0],
			events[2],
			events[3]
		])
	})

	it('respects the requested limit after de-duplicating repositories', () => {
		const events = [
			createActivity('1', 'owner/app-a', '2026-04-08T12:00:00.000Z'),
			createActivity('2', 'owner/app-b', '2026-04-08T11:00:00.000Z'),
			createActivity('3', 'owner/app-c', '2026-04-08T10:00:00.000Z')
		]

		expect(selectDistinctRecentActivity(events, 2)).toEqual([
			events[0],
			events[1]
		])
	})
})

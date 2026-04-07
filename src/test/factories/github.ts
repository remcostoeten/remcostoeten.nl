export function createContributionDay(date: string, contributionCount: number) {
	return {
		date,
		contributionCount
	}
}

export function createContributionWeek(
	firstDay: string,
	days: Array<{ date: string; contributionCount: number }>
) {
	return {
		firstDay,
		contributionDays: days
	}
}

export function createGitHubActivity(overrides: Record<string, unknown> = {}) {
	return {
		id: 'activity-1',
		timestamp: '2026-03-30T06:00:00.000Z',
		repository: 'remcostoeten/remcostoeten.nl',
		url: 'https://github.com/remcostoeten/remcostoeten.nl',
		isPrivate: false,
		type: 'commit',
		title: 'Pushed code',
		description: 'Refined release gate',
		...overrides
	}
}

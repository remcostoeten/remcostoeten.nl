const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
})

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC'
})

export function formatShortDate(dateString: string): string {
	return SHORT_DATE_FORMATTER.format(new Date(dateString))
}

export function formatDate(dateString: string): string {
	return LONG_DATE_FORMATTER.format(new Date(dateString))
}

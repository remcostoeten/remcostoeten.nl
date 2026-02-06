export function formatRelativeDate(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays === 0) return 'today'
	if (diffDays === 1) return 'yesterday'
	if (diffDays < 7) return `${diffDays}d ago`
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
	if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
	return `${Math.floor(diffDays / 365)}y ago`
}

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
}

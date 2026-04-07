export type GitHubEventType =
	| 'commit'
	| 'pr'
	| 'issue'
	| 'review'
	| 'release'
	| 'fork'
	| 'star'
	| 'create'
	| 'delete'
	| 'unknown'

export interface GitHubEventDetail {
	id: string
	type: GitHubEventType
	title: string
	description: string
	url: string
	repository: string
	timestamp: string
	isPrivate: boolean
	icon?: string
	payload?: unknown
}

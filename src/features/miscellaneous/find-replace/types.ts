export type TFindOptions = {
	caseSensitive: boolean
	wholeWord: boolean
	regex: boolean
	multiline: boolean
	preserveCase: boolean
	trimWhitespace: boolean
}

export type TSnapshot = {
	id: string
	label: string
	createdAt: number
	pinned: boolean
	input: string
	output: string
	search: string
	replace: string
	options: TFindOptions
	replacementCount: number
}

export type TWorkspace = {
	id: string
	name: string
	pinned: boolean
	createdAt: number
	updatedAt: number
	input: string
	output: string
	search: string
	replace: string
	options: TFindOptions
	snapshots: TSnapshot[]
}

export type TPersistedState = {
	version: number
	activeWorkspaceId: string
	workspaces: TWorkspace[]
}

export type TMatch = {
	start: number
	end: number
}

export type TSearchResult =
	| { ok: true; matches: TMatch[]; truncated: boolean }
	| { ok: false; error: string }

export type TReplaceResult =
	| { ok: true; text: string; count: number }
	| { ok: false; error: string }

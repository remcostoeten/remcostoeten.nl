import { DEFAULT_OPTIONS, STORAGE_KEY, STORAGE_VERSION } from '../constants'
import type { TFindOptions, TPersistedState, TWorkspace } from '../types'

export function createId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID()
	}
	return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

export function createWorkspace(name: string): TWorkspace {
	const now = Date.now()
	return {
		id: createId(),
		name,
		pinned: false,
		createdAt: now,
		updatedAt: now,
		input: '',
		output: '',
		search: '',
		replace: '',
		options: { ...DEFAULT_OPTIONS },
		snapshots: []
	}
}

export function createInitialState(): TPersistedState {
	const workspace = createWorkspace('Workspace 1')
	return {
		version: STORAGE_VERSION,
		activeWorkspaceId: workspace.id,
		workspaces: [workspace]
	}
}

function sanitizeOptions(value: unknown): TFindOptions {
	const source = (value ?? {}) as Partial<TFindOptions>
	return {
		caseSensitive: source.caseSensitive === true,
		wholeWord: source.wholeWord === true,
		regex: source.regex === true,
		multiline: source.multiline === true,
		preserveCase: source.preserveCase === true,
		trimWhitespace: source.trimWhitespace === true
	}
}

function sanitizeWorkspace(value: unknown): TWorkspace | null {
	if (typeof value !== 'object' || value === null) return null
	const source = value as Partial<TWorkspace>
	if (typeof source.id !== 'string' || typeof source.name !== 'string') {
		return null
	}
	return {
		id: source.id,
		name: source.name,
		pinned: source.pinned === true,
		createdAt:
			typeof source.createdAt === 'number'
				? source.createdAt
				: Date.now(),
		updatedAt:
			typeof source.updatedAt === 'number'
				? source.updatedAt
				: Date.now(),
		input: typeof source.input === 'string' ? source.input : '',
		output: typeof source.output === 'string' ? source.output : '',
		search: typeof source.search === 'string' ? source.search : '',
		replace: typeof source.replace === 'string' ? source.replace : '',
		options: sanitizeOptions(source.options),
		snapshots: Array.isArray(source.snapshots)
			? source.snapshots.filter(
					snapshot =>
						typeof snapshot === 'object' &&
						snapshot !== null &&
						typeof snapshot.id === 'string' &&
						typeof snapshot.input === 'string' &&
						typeof snapshot.output === 'string'
				)
			: []
	}
}

export function sanitizeWorkspaces(value: unknown): TWorkspace[] {
	if (!Array.isArray(value)) return []
	return value
		.map(sanitizeWorkspace)
		.filter((workspace): workspace is TWorkspace => workspace !== null)
}

export function loadPersistedState(): TPersistedState {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (raw === null) return createInitialState()
		const parsed = JSON.parse(raw) as Partial<TPersistedState>
		const workspaces = sanitizeWorkspaces(parsed.workspaces)
		if (workspaces.length === 0) return createInitialState()
		const activeWorkspaceId = workspaces.some(
			workspace => workspace.id === parsed.activeWorkspaceId
		)
			? (parsed.activeWorkspaceId as string)
			: workspaces[0].id
		return { version: STORAGE_VERSION, activeWorkspaceId, workspaces }
	} catch (error) {
		console.warn('Could not restore find & replace state', error)
		return createInitialState()
	}
}

export function savePersistedState(state: TPersistedState): void {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
	} catch (error) {
		console.warn('Could not persist find & replace state', error)
	}
}

'use client'

import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState
} from 'react'
import {
	LIVE_PREVIEW_CHAR_LIMIT,
	MAX_SNAPSHOTS,
	MAX_UNDO_STEPS,
	MAX_WORKSPACES
} from '../constants'
import type {
	TFindOptions,
	TPersistedState,
	TSnapshot,
	TWorkspace
} from '../types'
import { applyReplacement, findMatches } from '../utils/search'
import type { TReplaceMode } from '../utils/search'
import {
	createId,
	createInitialState,
	createWorkspace,
	loadPersistedState,
	savePersistedState
} from '../utils/storage'

type TState = {
	hydrated: boolean
	activeWorkspaceId: string
	workspaces: TWorkspace[]
	undoStack: string[]
	redoStack: string[]
}

type TAction =
	| { type: 'hydrate'; state: TPersistedState }
	| { type: 'patch-workspace'; patch: Partial<TWorkspace> }
	| { type: 'set-input'; text: string; pushUndo: boolean }
	| { type: 'undo' }
	| { type: 'redo' }
	| { type: 'create-workspace' }
	| { type: 'rename-workspace'; id: string; name: string }
	| { type: 'duplicate-workspace'; id: string }
	| { type: 'delete-workspace'; id: string }
	| { type: 'switch-workspace'; id: string }
	| { type: 'toggle-pin-workspace'; id: string }
	| { type: 'import-workspaces'; workspaces: TWorkspace[] }
	| { type: 'add-snapshot'; snapshot: TSnapshot }
	| { type: 'patch-snapshot'; id: string; patch: Partial<TSnapshot> }
	| { type: 'delete-snapshot'; id: string }
	| { type: 'duplicate-snapshot'; id: string }
	| { type: 'restore-snapshot'; id: string }

function getActive(state: TState): TWorkspace {
	return (
		state.workspaces.find(
			workspace => workspace.id === state.activeWorkspaceId
		) ?? state.workspaces[0]
	)
}

function patchActive(state: TState, patch: Partial<TWorkspace>): TState {
	return {
		...state,
		workspaces: state.workspaces.map(workspace =>
			workspace.id === state.activeWorkspaceId
				? { ...workspace, ...patch, updatedAt: Date.now() }
				: workspace
		)
	}
}

function pushUndoState(state: TState, previousInput: string): TState {
	return {
		...state,
		undoStack: [...state.undoStack, previousInput].slice(-MAX_UNDO_STEPS),
		redoStack: []
	}
}

function capSnapshots(snapshots: TSnapshot[]): TSnapshot[] {
	if (snapshots.length <= MAX_SNAPSHOTS) return snapshots
	const removable = snapshots.findIndex(snapshot => !snapshot.pinned)
	if (removable === -1) return snapshots.slice(0, MAX_SNAPSHOTS)
	return snapshots.filter((_, index) => index !== removable)
}

function nextWorkspaceName(workspaces: TWorkspace[]): string {
	return `Workspace ${workspaces.length + 1}`
}

function reducer(state: TState, action: TAction): TState {
	const active = getActive(state)

	switch (action.type) {
		case 'hydrate':
			return {
				...state,
				hydrated: true,
				activeWorkspaceId: action.state.activeWorkspaceId,
				workspaces: action.state.workspaces
			}

		case 'patch-workspace':
			return patchActive(state, action.patch)

		case 'set-input': {
			if (action.text === active.input) return state
			const next = patchActive(state, { input: action.text })
			return action.pushUndo ? pushUndoState(next, active.input) : next
		}

		case 'undo': {
			if (state.undoStack.length === 0) return state
			const previous = state.undoStack[state.undoStack.length - 1]
			const next = patchActive(state, { input: previous })
			return {
				...next,
				undoStack: state.undoStack.slice(0, -1),
				redoStack: [...state.redoStack, active.input]
			}
		}

		case 'redo': {
			if (state.redoStack.length === 0) return state
			const restored = state.redoStack[state.redoStack.length - 1]
			const next = patchActive(state, { input: restored })
			return {
				...next,
				undoStack: [...state.undoStack, active.input].slice(
					-MAX_UNDO_STEPS
				),
				redoStack: state.redoStack.slice(0, -1)
			}
		}

		case 'create-workspace': {
			if (state.workspaces.length >= MAX_WORKSPACES) return state
			const workspace = createWorkspace(
				nextWorkspaceName(state.workspaces)
			)
			return {
				...state,
				workspaces: [...state.workspaces, workspace],
				activeWorkspaceId: workspace.id,
				undoStack: [],
				redoStack: []
			}
		}

		case 'rename-workspace':
			return {
				...state,
				workspaces: state.workspaces.map(workspace =>
					workspace.id === action.id
						? {
								...workspace,
								name: action.name,
								updatedAt: Date.now()
							}
						: workspace
				)
			}

		case 'duplicate-workspace': {
			if (state.workspaces.length >= MAX_WORKSPACES) return state
			const source = state.workspaces.find(
				workspace => workspace.id === action.id
			)
			if (!source) return state
			const copy: TWorkspace = {
				...source,
				id: createId(),
				name: `${source.name} copy`,
				pinned: false,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				snapshots: source.snapshots.map(snapshot => ({
					...snapshot,
					id: createId()
				}))
			}
			return {
				...state,
				workspaces: [...state.workspaces, copy],
				activeWorkspaceId: copy.id,
				undoStack: [],
				redoStack: []
			}
		}

		case 'delete-workspace': {
			const remaining = state.workspaces.filter(
				workspace => workspace.id !== action.id
			)
			if (remaining.length === 0) {
				const initial = createInitialState()
				return {
					...state,
					workspaces: initial.workspaces,
					activeWorkspaceId: initial.activeWorkspaceId,
					undoStack: [],
					redoStack: []
				}
			}
			return {
				...state,
				workspaces: remaining,
				activeWorkspaceId:
					state.activeWorkspaceId === action.id
						? remaining[0].id
						: state.activeWorkspaceId,
				undoStack: [],
				redoStack: []
			}
		}

		case 'switch-workspace': {
			if (
				action.id === state.activeWorkspaceId ||
				!state.workspaces.some(workspace => workspace.id === action.id)
			) {
				return state
			}
			return {
				...state,
				activeWorkspaceId: action.id,
				undoStack: [],
				redoStack: []
			}
		}

		case 'toggle-pin-workspace':
			return {
				...state,
				workspaces: state.workspaces.map(workspace =>
					workspace.id === action.id
						? { ...workspace, pinned: !workspace.pinned }
						: workspace
				)
			}

		case 'import-workspaces': {
			if (action.workspaces.length === 0) return state
			const existingIds = new Set(
				state.workspaces.map(workspace => workspace.id)
			)
			const imported = action.workspaces.map(workspace =>
				existingIds.has(workspace.id)
					? { ...workspace, id: createId() }
					: workspace
			)
			const merged = [...state.workspaces, ...imported].slice(
				0,
				MAX_WORKSPACES
			)
			return { ...state, workspaces: merged }
		}

		case 'add-snapshot':
			return patchActive(state, {
				snapshots: capSnapshots([action.snapshot, ...active.snapshots])
			})

		case 'patch-snapshot':
			return patchActive(state, {
				snapshots: active.snapshots.map(snapshot =>
					snapshot.id === action.id
						? { ...snapshot, ...action.patch }
						: snapshot
				)
			})

		case 'delete-snapshot':
			return patchActive(state, {
				snapshots: active.snapshots.filter(
					snapshot => snapshot.id !== action.id
				)
			})

		case 'duplicate-snapshot': {
			const source = active.snapshots.find(
				snapshot => snapshot.id === action.id
			)
			if (!source) return state
			const copy: TSnapshot = {
				...source,
				id: createId(),
				label: `${source.label} copy`,
				pinned: false,
				createdAt: Date.now()
			}
			return patchActive(state, {
				snapshots: capSnapshots([copy, ...active.snapshots])
			})
		}

		case 'restore-snapshot': {
			const snapshot = active.snapshots.find(
				item => item.id === action.id
			)
			if (!snapshot) return state
			const next = patchActive(state, {
				input: snapshot.input,
				output: snapshot.output,
				search: snapshot.search,
				replace: snapshot.replace,
				options: { ...snapshot.options }
			})
			return pushUndoState(next, active.input)
		}

		default:
			return state
	}
}

function createEmptyState(): TState {
	const initial = createInitialState()
	return {
		hydrated: false,
		activeWorkspaceId: initial.activeWorkspaceId,
		workspaces: initial.workspaces,
		undoStack: [],
		redoStack: []
	}
}

export function useFindReplaceStore() {
	const [state, dispatch] = useReducer(reducer, undefined, createEmptyState)
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
	const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		dispatch({ type: 'hydrate', state: loadPersistedState() })
	}, [])

	useEffect(() => {
		if (!state.hydrated) return
		if (saveTimeout.current) clearTimeout(saveTimeout.current)
		const snapshot: TPersistedState = {
			version: 1,
			activeWorkspaceId: state.activeWorkspaceId,
			workspaces: state.workspaces
		}
		saveTimeout.current = setTimeout(() => {
			savePersistedState(snapshot)
		}, 300)
		return () => {
			if (saveTimeout.current) clearTimeout(saveTimeout.current)
		}
	}, [state.hydrated, state.activeWorkspaceId, state.workspaces])

	const workspace = getActive(state)

	const deferredInput = useDeferredValue(workspace.input)
	const deferredSearch = useDeferredValue(workspace.search)
	const deferredOptions = useDeferredValue(workspace.options)
	const deferredReplace = useDeferredValue(workspace.replace)

	const searchResult = useMemo(
		() => findMatches(deferredInput, deferredSearch, deferredOptions),
		[deferredInput, deferredSearch, deferredOptions]
	)

	const livePreview = useMemo(() => {
		if (
			deferredSearch === '' ||
			deferredInput.length > LIVE_PREVIEW_CHAR_LIMIT
		) {
			return null
		}
		const result = applyReplacement(
			deferredInput,
			deferredSearch,
			deferredReplace,
			deferredOptions,
			'all'
		)
		return result.ok ? result : null
	}, [deferredInput, deferredSearch, deferredReplace, deferredOptions])

	const matches = searchResult.ok ? searchResult.matches : []

	useEffect(() => {
		setCurrentMatchIndex(index =>
			matches.length === 0 ? 0 : Math.min(index, matches.length - 1)
		)
	}, [matches.length])

	const displayedOutput =
		livePreview !== null ? livePreview.text : workspace.output

	const setSearch = useCallback((search: string) => {
		dispatch({ type: 'patch-workspace', patch: { search } })
		setCurrentMatchIndex(0)
	}, [])

	const setReplace = useCallback((replace: string) => {
		dispatch({ type: 'patch-workspace', patch: { replace } })
	}, [])

	const toggleOption = useCallback(
		(key: keyof TFindOptions) => {
			dispatch({
				type: 'patch-workspace',
				patch: {
					options: {
						...workspace.options,
						[key]: !workspace.options[key]
					}
				}
			})
			setCurrentMatchIndex(0)
		},
		[workspace.options]
	)

	const setInput = useCallback((text: string) => {
		dispatch({ type: 'set-input', text, pushUndo: false })
	}, [])

	const commitInput = useCallback((text: string) => {
		dispatch({ type: 'set-input', text, pushUndo: true })
	}, [])

	const setOutput = useCallback((output: string) => {
		dispatch({ type: 'patch-workspace', patch: { output } })
	}, [])

	const makeSnapshot = useCallback(
		(
			label: string,
			output: string,
			replacementCount: number
		): TSnapshot => ({
			id: createId(),
			label,
			createdAt: Date.now(),
			pinned: false,
			input: workspace.input,
			output,
			search: workspace.search,
			replace: workspace.replace,
			options: { ...workspace.options },
			replacementCount
		}),
		[workspace]
	)

	const replaceAll = useCallback(() => {
		const result = applyReplacement(
			workspace.input,
			workspace.search,
			workspace.replace,
			workspace.options,
			'all'
		)
		if (!result.ok) return result
		dispatch({ type: 'patch-workspace', patch: { output: result.text } })
		dispatch({
			type: 'add-snapshot',
			snapshot: makeSnapshot(
				`Replace all · ${result.count} change${result.count === 1 ? '' : 's'}`,
				result.text,
				result.count
			)
		})
		return result
	}, [workspace, makeSnapshot])

	const replaceFirst = useCallback(() => {
		const result = applyReplacement(
			workspace.input,
			workspace.search,
			workspace.replace,
			workspace.options,
			'first'
		)
		if (!result.ok) return result
		dispatch({ type: 'patch-workspace', patch: { output: result.text } })
		return result
	}, [workspace])

	const replaceCurrent = useCallback(() => {
		if (matches.length === 0) return { ok: true as const, count: 0 }
		const result = applyReplacement(
			workspace.input,
			workspace.search,
			workspace.replace,
			workspace.options,
			{ nth: currentMatchIndex }
		)
		if (!result.ok) return result
		dispatch({ type: 'set-input', text: result.text, pushUndo: true })
		return result
	}, [workspace, matches.length, currentMatchIndex])

	const replaceAdvanced = useCallback(
		(mode: TReplaceMode, label: string) => {
			const result = applyReplacement(
				workspace.input,
				workspace.search,
				workspace.replace,
				workspace.options,
				mode
			)
			if (!result.ok) return result
			dispatch({
				type: 'patch-workspace',
				patch: { output: result.text }
			})
			if (result.count > 0) {
				dispatch({
					type: 'add-snapshot',
					snapshot: makeSnapshot(
						`${label} · ${result.count} change${result.count === 1 ? '' : 's'}`,
						result.text,
						result.count
					)
				})
			}
			return result
		},
		[workspace, makeSnapshot]
	)

	const nextMatch = useCallback(() => {
		if (matches.length === 0) return
		setCurrentMatchIndex(index => (index + 1) % matches.length)
	}, [matches.length])

	const previousMatch = useCallback(() => {
		if (matches.length === 0) return
		setCurrentMatchIndex(
			index => (index - 1 + matches.length) % matches.length
		)
	}, [matches.length])

	const createSnapshot = useCallback(
		(label?: string) => {
			dispatch({
				type: 'add-snapshot',
				snapshot: makeSnapshot(
					label ?? `Snapshot · ${new Date().toLocaleTimeString()}`,
					displayedOutput,
					livePreview?.count ?? 0
				)
			})
		},
		[makeSnapshot, displayedOutput, livePreview]
	)

	const swapPanels = useCallback(() => {
		dispatch({ type: 'set-input', text: displayedOutput, pushUndo: true })
		dispatch({
			type: 'patch-workspace',
			patch: { output: workspace.input }
		})
	}, [displayedOutput, workspace.input])

	return {
		hydrated: state.hydrated,
		workspaces: state.workspaces,
		workspace,
		matches,
		searchError: searchResult.ok ? null : searchResult.error,
		matchesTruncated: searchResult.ok ? searchResult.truncated : false,
		currentMatchIndex,
		setCurrentMatchIndex,
		displayedOutput,
		previewCount: livePreview?.count ?? null,
		canUndo: state.undoStack.length > 0,
		canRedo: state.redoStack.length > 0,
		setSearch,
		setReplace,
		toggleOption,
		setInput,
		commitInput,
		setOutput,
		replaceAll,
		replaceFirst,
		replaceCurrent,
		replaceAdvanced,
		nextMatch,
		previousMatch,
		createSnapshot,
		swapPanels,
		undo: useCallback(() => dispatch({ type: 'undo' }), []),
		redo: useCallback(() => dispatch({ type: 'redo' }), []),
		createWorkspace: useCallback(
			() => dispatch({ type: 'create-workspace' }),
			[]
		),
		renameWorkspace: useCallback(
			(id: string, name: string) =>
				dispatch({ type: 'rename-workspace', id, name }),
			[]
		),
		duplicateWorkspace: useCallback(
			(id: string) => dispatch({ type: 'duplicate-workspace', id }),
			[]
		),
		deleteWorkspace: useCallback(
			(id: string) => dispatch({ type: 'delete-workspace', id }),
			[]
		),
		switchWorkspace: useCallback(
			(id: string) => dispatch({ type: 'switch-workspace', id }),
			[]
		),
		togglePinWorkspace: useCallback(
			(id: string) => dispatch({ type: 'toggle-pin-workspace', id }),
			[]
		),
		importWorkspaces: useCallback(
			(workspaces: TWorkspace[]) =>
				dispatch({ type: 'import-workspaces', workspaces }),
			[]
		),
		renameSnapshot: useCallback(
			(id: string, label: string) =>
				dispatch({ type: 'patch-snapshot', id, patch: { label } }),
			[]
		),
		togglePinSnapshot: useCallback(
			(id: string, pinned: boolean) =>
				dispatch({ type: 'patch-snapshot', id, patch: { pinned } }),
			[]
		),
		deleteSnapshot: useCallback(
			(id: string) => dispatch({ type: 'delete-snapshot', id }),
			[]
		),
		duplicateSnapshot: useCallback(
			(id: string) => dispatch({ type: 'duplicate-snapshot', id }),
			[]
		),
		restoreSnapshot: useCallback(
			(id: string) => dispatch({ type: 'restore-snapshot', id }),
			[]
		)
	}
}

export type TFindReplaceStore = ReturnType<typeof useFindReplaceStore>

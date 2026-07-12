import { DEFAULT_OPTIONS, MAX_INPUT_CHARS, STORAGE_KEY } from '../constants'
import type { TPersistedState } from '../types'

export function createInitialState(): TPersistedState {
	return {
		version: 1,
		input: '',
		options: { ...DEFAULT_OPTIONS },
		openBatchSize: 5
	}
}

export function loadPersistedState(): TPersistedState {
	const initial = createInitialState()
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (raw === null) return initial
		const parsed = JSON.parse(raw) as Partial<TPersistedState>
		if (parsed.version !== 1) return initial
		return {
			version: 1,
			input:
				typeof parsed.input === 'string'
					? parsed.input.slice(0, MAX_INPUT_CHARS)
					: '',
			options: { ...DEFAULT_OPTIONS, ...parsed.options },
			openBatchSize:
				typeof parsed.openBatchSize === 'number'
					? parsed.openBatchSize
					: 5
		}
	} catch (error) {
		console.warn('Could not read the link extractor state', error)
		return initial
	}
}

export function savePersistedState(state: TPersistedState) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
	} catch (error) {
		console.warn('Could not persist the link extractor state', error)
	}
}

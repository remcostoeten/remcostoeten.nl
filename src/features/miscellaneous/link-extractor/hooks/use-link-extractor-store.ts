'use client'

import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { DEFAULT_OPTIONS, MAX_INPUT_CHARS } from '../constants'
import type { TExtractorOptions, TPersistedState } from '../types'
import { runPipeline } from '../utils/pipeline'
import {
	createInitialState,
	loadPersistedState,
	savePersistedState
} from '../utils/storage'

export function useLinkExtractorStore() {
	const [state, setState] = useState<TPersistedState>(createInitialState)
	const [hydrated, setHydrated] = useState(false)
	const [openedUrls, setOpenedUrls] = useState<ReadonlySet<string>>(
		() => new Set()
	)
	const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		setState(loadPersistedState())
		setHydrated(true)
	}, [])

	useEffect(() => {
		if (!hydrated) return
		if (saveTimeout.current) clearTimeout(saveTimeout.current)
		saveTimeout.current = setTimeout(() => savePersistedState(state), 300)
		return () => {
			if (saveTimeout.current) clearTimeout(saveTimeout.current)
		}
	}, [hydrated, state])

	const deferredInput = useDeferredValue(state.input)
	const deferredOptions = useDeferredValue(state.options)

	const result = useMemo(
		() => runPipeline(deferredInput, deferredOptions),
		[deferredInput, deferredOptions]
	)

	const urls = useMemo(
		() =>
			result.lines
				.map(line => line.url)
				.filter((url): url is string => url !== null),
		[result.lines]
	)

	const outputText = useMemo(
		() => result.lines.map(line => line.text).join('\n'),
		[result.lines]
	)

	const setInput = useCallback((input: string) => {
		setState(previous => ({
			...previous,
			input: input.slice(0, MAX_INPUT_CHARS)
		}))
	}, [])

	const setOption = useCallback(
		<TKey extends keyof TExtractorOptions>(
			key: TKey,
			value: TExtractorOptions[TKey]
		) => {
			setState(previous => ({
				...previous,
				options: { ...previous.options, [key]: value }
			}))
		},
		[]
	)

	const toggleOption = useCallback(
		(
			key: {
				[TKey in keyof TExtractorOptions]: TExtractorOptions[TKey] extends boolean
					? TKey
					: never
			}[keyof TExtractorOptions]
		) => {
			setState(previous => ({
				...previous,
				options: { ...previous.options, [key]: !previous.options[key] }
			}))
		},
		[]
	)

	const setOpenBatchSize = useCallback((openBatchSize: number) => {
		setState(previous => ({ ...previous, openBatchSize }))
	}, [])

	const resetOptions = useCallback(() => {
		setState(previous => ({ ...previous, options: { ...DEFAULT_OPTIONS } }))
	}, [])

	const clearInput = useCallback(() => {
		setState(previous => ({ ...previous, input: '' }))
		setOpenedUrls(new Set())
	}, [])

	const markOpened = useCallback((opened: string[]) => {
		setOpenedUrls(previous => {
			const next = new Set(previous)
			for (const url of opened) next.add(url)
			return next
		})
	}, [])

	const clearOpened = useCallback(() => setOpenedUrls(new Set()), [])

	return {
		hydrated,
		input: state.input,
		options: state.options,
		openBatchSize: state.openBatchSize,
		result,
		urls,
		outputText,
		openedUrls,
		pending: deferredInput !== state.input,
		setInput,
		setOption,
		toggleOption,
		setOpenBatchSize,
		resetOptions,
		clearInput,
		markOpened,
		clearOpened
	}
}

export type TLinkExtractorStore = ReturnType<typeof useLinkExtractorStore>

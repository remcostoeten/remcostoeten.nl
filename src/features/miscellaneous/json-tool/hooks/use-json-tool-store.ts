'use client'

import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { MAX_INPUT_CHARS } from '../constants'
import type {
	TConversion,
	TIndent,
	TJsonToolOptions,
	TPersistedState
} from '../types'
import { toCsv, toTypeScript, toYaml } from '../utils/convert'
import { measure, parseJson, sortKeysDeep } from '../utils/parse'
import {
	createInitialState,
	loadPersistedState,
	savePersistedState
} from '../utils/storage'

function indentOf(indent: TIndent): string | number {
	if (indent === 'tab') return '\t'
	return Number(indent)
}

export function useJsonToolStore() {
	const [state, setState] = useState<TPersistedState>(createInitialState)
	const [hydrated, setHydrated] = useState(false)
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

	const parsed = useMemo(
		() => parseJson(deferredInput.trim() === '' ? 'null' : deferredInput),
		[deferredInput]
	)

	const value = useMemo(() => {
		if (!parsed.ok) return null
		return deferredOptions.sortKeys
			? sortKeysDeep(parsed.value)
			: parsed.value
	}, [parsed, deferredOptions.sortKeys])

	const stats = useMemo(() => {
		if (value === null || deferredInput.trim() === '') return null
		return measure(value, new Blob([deferredInput]).size)
	}, [value, deferredInput])

	const output = useMemo<TConversion>(() => {
		if (!parsed.ok) return { ok: false, error: parsed.error }
		if (deferredInput.trim() === '') return { ok: true, text: '' }

		switch (deferredOptions.mode) {
			case 'formatted':
				return {
					ok: true,
					text: JSON.stringify(
						value,
						null,
						indentOf(deferredOptions.indent)
					)
				}
			case 'minified':
				return { ok: true, text: JSON.stringify(value) }
			case 'yaml':
				return toYaml(value)
			case 'csv':
				return toCsv(value)
			case 'typescript':
				return toTypeScript(value, deferredOptions.typeName)
		}
	}, [parsed, value, deferredInput, deferredOptions])

	const setInput = useCallback((input: string) => {
		setState(previous => ({
			...previous,
			input: input.slice(0, MAX_INPUT_CHARS)
		}))
	}, [])

	const setOption = useCallback(
		<TKey extends keyof TJsonToolOptions>(
			key: TKey,
			optionValue: TJsonToolOptions[TKey]
		) => {
			setState(previous => ({
				...previous,
				options: { ...previous.options, [key]: optionValue }
			}))
		},
		[]
	)

	const toggleSortKeys = useCallback(() => {
		setState(previous => ({
			...previous,
			options: {
				...previous.options,
				sortKeys: !previous.options.sortKeys
			}
		}))
	}, [])

	const applyToInput = useCallback(() => {
		setState(previous => {
			const result = parseJson(previous.input)
			if (!result.ok) return previous
			const next = previous.options.sortKeys
				? sortKeysDeep(result.value)
				: result.value
			return {
				...previous,
				input: JSON.stringify(
					next,
					null,
					indentOf(previous.options.indent)
				)
			}
		})
	}, [])

	const clearInput = useCallback(() => {
		setState(previous => ({ ...previous, input: '' }))
	}, [])

	return {
		hydrated,
		input: state.input,
		options: state.options,
		error: parsed.ok ? null : parsed,
		stats,
		output,
		pending: deferredInput !== state.input,
		setInput,
		setOption,
		toggleSortKeys,
		applyToInput,
		clearInput
	}
}

export type TJsonToolStore = ReturnType<typeof useJsonToolStore>

import {
	startTransition,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { extractSvgs } from '../utilities/extract-svgs'
import {
	componentName,
	filenameFor,
	toKebabCase,
	uniqueName
} from '../utilities/format-name'
import { normalizeSources } from '../utilities/normalize-svg'
import type { ConversionSettings, SvgItem } from '../types/svg-converter'

export function useSvgCollection() {
	const [input, setInput] = useState('')
	const [items, setItems] = useState<SvgItem[]>([])
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [focusedId, setFocusedId] = useState<string>()
	const [inputMessage, setInputMessage] = useState('')
	const immediateValue = useRef<string | undefined>(undefined)

	const commit = useCallback(
		(value: string, filenames?: (string | undefined)[]) => {
			const result = extractSvgs(value)
			const normalized = normalizeSources(result.sources, filenames)
			startTransition(() => {
				setItems(normalized)
				setSelected(
					new Set(
						normalized
							.filter(item => item.state !== 'invalid')
							.map(item => item.id)
					)
				)
				setFocusedId(normalized[0]?.id)
				setInputMessage(
					normalized.length === 0 && value.trim()
						? 'No complete SVG elements were found.'
						: result.errors.join(' ')
				)
			})
		},
		[]
	)

	useEffect(() => {
		if (immediateValue.current === input) {
			immediateValue.current = undefined
			return
		}
		const timeout = setTimeout(() => commit(input), 250)
		return () => clearTimeout(timeout)
	}, [input, commit])

	const processImmediately = useCallback(
		(value: string, filenames?: (string | undefined)[]) => {
			immediateValue.current = value
			setInput(value)
			commit(value, filenames)
		},
		[commit]
	)

	const clear = useCallback(() => {
		setInput('')
		setItems([])
		setSelected(new Set())
		setFocusedId(undefined)
		setInputMessage('')
	}, [])

	const remove = useCallback((ids: Iterable<string>) => {
		const removeSet = new Set(ids)
		setItems(current =>
			current
				.filter(item => !removeSet.has(item.id))
				.map((item, index) => ({ ...item, index: index + 1 }))
		)
		setFocusedId(currentFocus =>
			currentFocus && removeSet.has(currentFocus)
				? undefined
				: currentFocus
		)
		setSelected(
			current => new Set([...current].filter(id => !removeSet.has(id)))
		)
	}, [])

	const rename = useCallback((id: string, value: string) => {
		setItems(current => {
			const used = new Set(
				current
					.filter(item => item.id !== id)
					.map(item => item.component)
			)
			return current.map(item => {
				if (item.id !== id) return item
				const base = componentName(value, item.component)
				const component = uniqueName(base, used)
				const duplicateWarning =
					'A duplicate component name was resolved automatically.'
				const warnings = item.warnings.filter(
					warning =>
						warning !== duplicateWarning &&
						warning !== 'The component name was normalized.'
				)
				if (component !== base) warnings.push(duplicateWarning)
				if (component !== value)
					warnings.push('The component name was normalized.')
				return {
					...item,
					name: value,
					component,
					filename: filenameFor(component),
					warnings,
					state: item.errors.length
						? 'invalid'
						: warnings.length
							? 'warning'
							: 'valid'
				}
			})
		})
	}, [])

	const updateSettings = useCallback(
		(ids: Iterable<string>, patch: Partial<ConversionSettings>) => {
			const targets = new Set(ids)
			setItems(current =>
				current.map(item =>
					targets.has(item.id)
						? { ...item, settings: { ...item.settings, ...patch } }
						: item
				)
			)
		},
		[]
	)
	const updateFilename = useCallback((id: string, value: string) => {
		setItems(current => {
			const used = new Set(
				current
					.filter(item => item.id !== id)
					.map(item => item.filename)
			)
			return current.map(item => {
				if (item.id !== id) return item
				const base =
					toKebabCase(value.replace(/\.tsx$/i, '')) ||
					toKebabCase(item.component)
				let filename = `${base}.tsx`
				let suffix = 2
				while (used.has(filename)) filename = `${base}-${suffix++}.tsx`
				return { ...item, filename }
			})
		})
	}, [])

	const reorder = useCallback((id: string, direction: -1 | 1) => {
		setItems(current => {
			const from = current.findIndex(item => item.id === id)
			const to = from + direction
			if (from < 0 || to < 0 || to >= current.length) return current
			const next = [...current]
			const [moved] = next.splice(from, 1)
			next.splice(to, 0, moved)
			return next.map((item, index) => ({ ...item, index: index + 1 }))
		})
	}, [])

	const focused = useMemo(
		() => items.find(item => item.id === focusedId) ?? items[0],
		[items, focusedId]
	)
	return {
		input,
		setInput,
		processImmediately,
		items,
		setItems,
		selected,
		setSelected,
		focusedId: focused?.id,
		setFocusedId,
		focused,
		inputMessage,
		clear,
		remove,
		rename,
		updateFilename,
		updateSettings,
		reorder
	}
}

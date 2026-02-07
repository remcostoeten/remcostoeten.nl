'use client'

import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
	useMemo,
	type ReactNode,
	type RefObject
} from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

// Check for debug flag via environment or global
const isDebugMode = () => {
	if (typeof window !== 'undefined') {
		return (window as any).__STAGGER_DEBUG__ === true
	}
	return process.env.NEXT_PUBLIC_STAGGER_DEBUG === 'true'
}

// =============================================================================
// Types
// =============================================================================

interface StaggerConfig {
	/** Base delay between each layer in ms (default: 80) */
	baseDelay: number
	/** Initial delay before first animation in ms (default: 0) */
	initialDelay: number
	/** Strategy for ordering elements */
	strategy: 'position' | 'mount-order'
	/** Threshold for grouping elements on same "row" (default: 50px) */
	rowThreshold: number
}

interface LayerData {
	id: string
	element: HTMLElement
	rect: DOMRect
	group: string
	priority: number
	mountTime: number
}

interface StaggerContextValue {
	config: StaggerConfig
	registerLayer: (
		id: string,
		element: HTMLElement,
		group: string,
		priority: number
	) => void
	unregisterLayer: (id: string) => void
	getLayerDelay: (id: string) => number
	getLayerIndex: (id: string) => number
	isGroupVisible: (group: string) => boolean
	markGroupVisible: (group: string) => void
}

interface UseStaggerLayerOptions {
	/** Group name for scoped staggering (default: 'default') */
	group?: string
	/** Priority override - lower = earlier (default: Infinity) */
	priority?: number
	/** Skip stagger system entirely */
	disabled?: boolean
}

interface UseStaggerLayerReturn<T extends HTMLElement = HTMLElement> {
	/** Calculated delay in ms */
	delay: number
	/** Ref to attach to element */
	ref: RefObject<T | null>
	/** True when animation should start */
	isReady: boolean
	/** Position in stagger order (0-based) */
	layerIndex: number
}

// =============================================================================
// Context
// =============================================================================

const DEFAULT_CONFIG: StaggerConfig = {
	baseDelay: 80,
	initialDelay: 0,
	strategy: 'position',
	rowThreshold: 50
}

const StaggerContext = createContext<StaggerContextValue | null>(null)

// =============================================================================
// Provider
// =============================================================================

interface StaggerProviderProps {
	children: ReactNode
	config?: Partial<StaggerConfig>
}

export function StaggerProvider({
	children,
	config: userConfig
}: StaggerProviderProps) {
	const config = useMemo(
		() => ({ ...DEFAULT_CONFIG, ...userConfig }),
		[userConfig]
	)
	const layersRef = useRef<Map<string, LayerData>>(new Map())
	const [visibleGroups, setVisibleGroups] = useState<Set<string>>(new Set())
	const [, forceUpdate] = useState(0)
	const debug = isDebugMode()

	const registerLayer = useCallback(
		(id: string, element: HTMLElement, group: string, priority: number) => {
			// Only calculate rect if strategy requires it to avoid reflows
			const rect =
				config.strategy === 'position'
					? element.getBoundingClientRect()
					: new DOMRect(0, 0, 0, 0)

			const data: LayerData = {
				id,
				element,
				rect,
				group,
				priority,
				mountTime: Date.now()
			}

			layersRef.current.set(id, data)

			if (debug) {
				console.log(`[Stagger] Register: ${id}`, {
					group,
					priority,
					position: { top: rect.top, left: rect.left }
				})
			}

			// Trigger re-render to recalculate delays
			forceUpdate(n => n + 1)
		},
		[debug]
	)

	const unregisterLayer = useCallback(
		(id: string) => {
			layersRef.current.delete(id)
			if (debug) {
				console.log(`[Stagger] Unregister: ${id}`)
			}
		},
		[debug]
	)

	const getSortedLayers = useCallback(
		(group?: string): LayerData[] => {
			const layers = Array.from(layersRef.current.values()).filter(
				l => !group || l.group === group
			)

			if (config.strategy === 'mount-order') {
				return layers.sort((a, b) => a.mountTime - b.mountTime)
			}

			// Position-based: sort by top position, then left position
			return layers.sort((a, b) => {
				// Priority override first (lower = earlier)
				if (a.priority !== b.priority) {
					return a.priority - b.priority
				}

				// Same "row" (within threshold) → sort by left
				if (Math.abs(a.rect.top - b.rect.top) < config.rowThreshold) {
					return a.rect.left - b.rect.left
				}

				// Otherwise sort by top
				return a.rect.top - b.rect.top
			})
		},
		[config.strategy, config.rowThreshold]
	)

	const getLayerIndex = useCallback(
		(id: string): number => {
			const layer = layersRef.current.get(id)
			if (!layer) return -1

			const sorted = getSortedLayers(layer.group)
			return sorted.findIndex(l => l.id === id)
		},
		[getSortedLayers]
	)

	const getLayerDelay = useCallback(
		(id: string): number => {
			const index = getLayerIndex(id)
			if (index === -1) return 0

			return config.initialDelay + index * config.baseDelay
		},
		[getLayerIndex, config.initialDelay, config.baseDelay]
	)

	const isGroupVisible = useCallback(
		(group: string): boolean => {
			return visibleGroups.has(group)
		},
		[visibleGroups]
	)

	const markGroupVisible = useCallback(
		(group: string) => {
			setVisibleGroups(prev => {
				if (prev.has(group)) return prev
				const next = new Set(prev)
				next.add(group)

				if (debug) {
					console.log(`[Stagger] Group visible: ${group}`)
					const layers = getSortedLayers(group)
					layers.forEach((l, i) => {
						const delay = config.initialDelay + i * config.baseDelay
						console.log(`  [${i}] ${l.id} @ ${delay}ms`)
					})
				}

				return next
			})
		},
		[debug, getSortedLayers, config.initialDelay, config.baseDelay]
	)

	const value = useMemo<StaggerContextValue>(
		() => ({
			config,
			registerLayer,
			unregisterLayer,
			getLayerDelay,
			getLayerIndex,
			isGroupVisible,
			markGroupVisible
		}),
		[
			config,
			registerLayer,
			unregisterLayer,
			getLayerDelay,
			getLayerIndex,
			isGroupVisible,
			markGroupVisible
		]
	)

	return (
		<StaggerContext.Provider value={value}>
			{children}
		</StaggerContext.Provider>
	)
}

// =============================================================================
// Hook
// =============================================================================

function useStaggerContext(): StaggerContextValue {
	const context = useContext(StaggerContext)
	if (!context) {
		throw new Error('useStaggerLayer must be used within a StaggerProvider')
	}
	return context
}

export function useStaggerLayer<T extends HTMLElement = HTMLElement>(
	options: UseStaggerLayerOptions = {}
): UseStaggerLayerReturn<T> {
	const { group = 'default', priority = Infinity, disabled = false } = options

	const {
		registerLayer,
		unregisterLayer,
		getLayerDelay,
		getLayerIndex,
		isGroupVisible,
		markGroupVisible
	} = useStaggerContext()

	const ref = useRef<T>(null)
	const idRef = useRef(`stagger-${Math.random().toString(36).substr(2, 9)}`)
	const id = idRef.current

	const shouldReduceMotion = useReducedMotion()
	const isInView = useInView(ref as RefObject<Element>, {
		once: true,
		margin: '-50px'
	})

	// Register/unregister on mount
	useEffect(() => {
		if (disabled || !ref.current) return

		registerLayer(id, ref.current, group, priority)
		return () => unregisterLayer(id)
	}, [id, group, priority, disabled, registerLayer, unregisterLayer])

	// Mark group visible when first element enters view
	useEffect(() => {
		if (isInView && !disabled) {
			markGroupVisible(group)
		}
	}, [isInView, group, disabled, markGroupVisible])

	const delay = disabled ? 0 : getLayerDelay(id)
	const layerIndex = disabled ? -1 : getLayerIndex(id)
	const isReady = disabled
		? true
		: shouldReduceMotion
			? true
			: isGroupVisible(group) && isInView

	return {
		delay,
		ref,
		isReady,
		layerIndex
	}
}

// =============================================================================
// Debug utilities
// =============================================================================

/**
 * Enable stagger debug mode from browser console:
 * window.__STAGGER_DEBUG__ = true
 *
 * Or via environment variable:
 * NEXT_PUBLIC_STAGGER_DEBUG=true
 */
export function enableStaggerDebug() {
	if (typeof window !== 'undefined') {
		;(window as any).__STAGGER_DEBUG__ = true
		console.log(
			'[Stagger] Debug mode enabled. Refresh to see registration logs.'
		)
	}
}

export function disableStaggerDebug() {
	if (typeof window !== 'undefined') {
		;(window as any).__STAGGER_DEBUG__ = false
		console.log('[Stagger] Debug mode disabled.')
	}
}

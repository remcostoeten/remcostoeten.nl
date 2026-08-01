'use client'

import { useCallback, useMemo, useState } from 'react'
import type { TTrimRange } from '../types/media'

const MIN_GAP_SECONDS = 0.1

function clampTrim(range: TTrimRange, duration: number): TTrimRange {
	const gap = Math.min(MIN_GAP_SECONDS, duration / 10)
	let start = Math.max(0, Math.min(range.start, duration))
	let end = Math.max(0, Math.min(range.end, duration))

	if (end <= start + gap) {
		end = Math.min(start + gap, duration)
		if (end >= duration) {
			start = Math.max(0, duration - gap)
			end = duration
		}
	}

	return { start, end }
}

function rangesEqual(a: TTrimRange, b: TTrimRange): boolean {
	return Math.abs(a.start - b.start) < 0.001 && Math.abs(a.end - b.end) < 0.001
}

/**
 * Trim-selection state for media tools: the current in/out range clamped to
 * the clip duration, plus a committed-state history for undo/reset.
 */
export function useTrimState() {
	const [duration, setDuration] = useState(0)
	const [trim, setTrim] = useState<TTrimRange>({ start: 0, end: 0 })
	const [history, setHistory] = useState<TTrimRange[]>([])

	const clear = useCallback(() => {
		setDuration(0)
		setTrim({ start: 0, end: 0 })
		setHistory([])
	}, [])

	const handleMetadata = useCallback(
		(nextDuration: number, initial?: TTrimRange) => {
			if (!Number.isFinite(nextDuration) || nextDuration <= 0) return
			const full = { start: 0, end: nextDuration }
			const start = initial ? clampTrim(initial, nextDuration) : full
			setDuration(nextDuration)
			setTrim(start)
			setHistory(rangesEqual(start, full) ? [full] : [full, start])
		},
		[]
	)

	const updateTrim = useCallback(
		(next: TTrimRange) => {
			setTrim(clampTrim(next, duration))
		},
		[duration]
	)

	const commitTrim = useCallback(() => {
		setHistory(previous => {
			const last = previous[previous.length - 1]
			if (last && rangesEqual(last, trim)) return previous
			return [...previous, trim]
		})
	}, [trim])

	const undoTrim = useCallback(() => {
		if (history.length < 2) return
		const next = history.slice(0, -1)
		setHistory(next)
		setTrim(next[next.length - 1])
	}, [history])

	const resetTrim = useCallback(() => {
		if (duration <= 0) return
		const full = { start: 0, end: duration }
		setTrim(full)
		setHistory(previous => {
			const last = previous[previous.length - 1]
			if (last && rangesEqual(last, full)) return previous
			return [...previous, full]
		})
	}, [duration])

	const hasTrim = useMemo(
		() =>
			duration > 0 && (trim.start > 0.01 || trim.end < duration - 0.01),
		[duration, trim]
	)

	return {
		trim,
		duration,
		hasTrim,
		canUndoTrim: history.length > 1,
		clear,
		handleMetadata,
		updateTrim,
		commitTrim,
		undoTrim,
		resetTrim
	}
}

export type TTrimState = ReturnType<typeof useTrimState>

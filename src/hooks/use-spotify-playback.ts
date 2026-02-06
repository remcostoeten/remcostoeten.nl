'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
	getCurrentPlayback,
	SpotifyTrack,
	formatDuration
} from '@/server/services/spotify'

export interface SpotifyPlaybackState {
	track: SpotifyTrack | null
	progress: number
	duration: number
	isPlaying: boolean
	percentage: number
	formattedProgress: string
	formattedDuration: string
}

// Adaptive polling based on connection quality
const getPollingInterval = () => {
	if (typeof navigator === 'undefined') return 10000

	const connection = (navigator as any).connection
	if (!connection) return 10000

	if (connection.saveData) return 30000 // Data saver mode
	if (
		connection.effectiveType === 'slow-2g' ||
		connection.effectiveType === '2g'
	)
		return 20000
	return 10000 // Normal connections
}

const TIMER_INTERVAL = 200 // Update local progress every 200ms
const DRIFT_THRESHOLD = 2000 // Hard reset if drift > 2 seconds

/**
 * Real-time Spotify playback monitor hook
 *
 * Performance optimizations:
 * - Uses Visibility API to pause polling when tab is hidden
 * - Delays initial poll by 3s to avoid blocking hydration
 * - Adaptive polling interval based on connection quality
 * - Uses cached token (via API) to avoid redundant auth
 */
export function useSpotifyPlayback(): SpotifyPlaybackState {
	const [state, setState] = useState<SpotifyPlaybackState>({
		track: null,
		progress: 0,
		duration: 0,
		isPlaying: false,
		percentage: 0,
		formattedProgress: '0:00',
		formattedDuration: '0:00'
	})

	const T0Ref = useRef<number>(0)
	const lastTrackIdRef = useRef<string | null>(null)
	const lastProgressRef = useRef<number>(0)
	const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const isVisibleRef = useRef<boolean>(true)

	const calculateProgress = useCallback(
		(isPlaying: boolean, duration: number): number => {
			if (!isPlaying) {
				return lastProgressRef.current
			}
			const elapsed = Date.now() - T0Ref.current
			return Math.min(elapsed, duration)
		},
		[]
	)

	const updateLocalProgress = useCallback(() => {
		setState(prev => {
			if (!prev.track || !prev.isPlaying) return prev

			const currentProgress = calculateProgress(
				prev.isPlaying,
				prev.duration
			)
			const percentage =
				prev.duration > 0 ? (currentProgress / prev.duration) * 100 : 0

			return {
				...prev,
				progress: currentProgress,
				percentage: Math.min(percentage, 100),
				formattedProgress: formatDuration(currentProgress)
			}
		})
	}, [calculateProgress])

	const fetchPlaybackState = useCallback(async () => {
		// Skip polling if tab is hidden (performance optimization)
		if (!isVisibleRef.current) return

		const playback = await getCurrentPlayback()

		if (!playback || !playback.track) {
			setState({
				track: null,
				progress: 0,
				duration: 0,
				isPlaying: false,
				percentage: 0,
				formattedProgress: '0:00',
				formattedDuration: '0:00'
			})
			lastTrackIdRef.current = null
			return
		}

		const { track, progress_ms, duration_ms, is_playing } = playback
		const trackChanged = lastTrackIdRef.current !== track.id

		const newT0 = Date.now() - progress_ms

		// Detect drift (if local progress differs significantly from API)
		const localProgress = calculateProgress(is_playing, duration_ms)
		const drift = Math.abs(localProgress - progress_ms)
		const shouldHardReset = drift > DRIFT_THRESHOLD || trackChanged

		if (shouldHardReset) {
			T0Ref.current = newT0
			lastProgressRef.current = progress_ms
		} else {
			// Soft sync: gradually adjust T0
			T0Ref.current = newT0
		}

		lastTrackIdRef.current = track.id
		lastProgressRef.current = progress_ms

		const percentage =
			duration_ms > 0 ? (progress_ms / duration_ms) * 100 : 0

		setState({
			track,
			progress: progress_ms,
			duration: duration_ms,
			isPlaying: is_playing,
			percentage: Math.min(percentage, 100),
			formattedProgress: formatDuration(progress_ms),
			formattedDuration: formatDuration(duration_ms)
		})
	}, [calculateProgress])

	const startPolling = useCallback(() => {
		if (pollIntervalRef.current) return // Already polling

		const POLL_INTERVAL = getPollingInterval()
		fetchPlaybackState()
		pollIntervalRef.current = setInterval(fetchPlaybackState, POLL_INTERVAL)
		timerIntervalRef.current = setInterval(
			updateLocalProgress,
			TIMER_INTERVAL
		)
	}, [fetchPlaybackState, updateLocalProgress])

	const stopPolling = useCallback(() => {
		if (pollIntervalRef.current) {
			clearInterval(pollIntervalRef.current)
			pollIntervalRef.current = null
		}
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current)
			timerIntervalRef.current = null
		}
	}, [])

	useEffect(() => {
		// Handle visibility change - pause polling when hidden
		const handleVisibilityChange = () => {
			isVisibleRef.current = document.visibilityState === 'visible'

			if (isVisibleRef.current) {
				// Tab became visible - resume polling immediately
				startPolling()
			} else {
				// Tab hidden - stop polling to save resources
				stopPolling()
			}
		}

		// Delay initial polling by 3 seconds to avoid blocking hydration (TBT optimization)
		const startupDelay = setTimeout(() => {
			if (document.visibilityState === 'visible') {
				startPolling()
			}
		}, 3000)

		// Listen for visibility changes
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			clearTimeout(startupDelay)
			stopPolling()
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange
			)
		}
	}, [startPolling, stopPolling])

	return state
}

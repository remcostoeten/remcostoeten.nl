'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { TTrimRange } from '../types/media'
import {
	loadMediaSession,
	saveMediaFile,
	saveMediaOutput,
	saveMediaTrim,
	type TPersistedOutput,
	type TPersistedSession
} from '../utils/media-persistence'

export type TRestoredMediaSession = TPersistedSession & { file: File }

function warn(error: unknown) {
	console.warn('Media session persistence failed', error)
}

/**
 * Restores a tool's last media session from IndexedDB on mount and exposes
 * fire-and-forget persistence for the input file, trim range, and output.
 * onRestore only fires when a file was previously saved.
 */
export function useMediaSession(
	toolKey: string,
	onRestore: (session: TRestoredMediaSession) => void
) {
	const onRestoreRef = useRef(onRestore)

	useEffect(() => {
		onRestoreRef.current = onRestore
	})

	useEffect(() => {
		let cancelled = false
		loadMediaSession(toolKey)
			.then(session => {
				if (cancelled || !session.file) return
				onRestoreRef.current({ ...session, file: session.file })
			})
			.catch(warn)
		return () => {
			cancelled = true
		}
	}, [toolKey])

	const persistFile = useCallback(
		(file: File | null) => {
			saveMediaFile(toolKey, file).catch(warn)
		},
		[toolKey]
	)

	const persistTrim = useCallback(
		(trim: TTrimRange | null) => {
			saveMediaTrim(toolKey, trim).catch(warn)
		},
		[toolKey]
	)

	const persistOutput = useCallback(
		(output: TPersistedOutput | null) => {
			saveMediaOutput(toolKey, output).catch(warn)
		},
		[toolKey]
	)

	return { persistFile, persistTrim, persistOutput }
}

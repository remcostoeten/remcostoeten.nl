'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { noop } from '@/shared/lib/noop'
import { useLocalStorage } from '../../hooks/use-local-storage'
import { useMediaSession } from '../../hooks/use-media-session'
import { useTrimState } from '../../hooks/use-trim-state'
import type { TTrimRange } from '../../types/media'
import {
	DEFAULT_OPTIONS,
	GIF_PRESETS,
	INPUT_NAME,
	MAX_INPUT_MB,
	OUTPUT_GIF,
	OUTPUT_MP4,
	STORAGE_KEY
} from '../constants'
import type { TGifFps, TOutputFile, TPersistedOptions, TStatus } from '../types'
import {
	deleteQuiet,
	execWithLogs,
	loadFFmpeg,
	probeLogs,
	readOutputBlob,
	setFFmpegProgressHandler,
	writeInputFile
} from '../../utils/ffmpeg'
import { stem } from '../../utils/format'
import {
	encodeArgs,
	gifArgs,
	isRemuxCompatible,
	remuxArgs
} from '../utils/ffmpeg'

const IDLE_STATUS: TStatus = {
	message: 'Select a video to get started.',
	mode: 'idle'
}

function toErrorStatus(error: unknown, fallback: string): TStatus {
	const message = error instanceof Error ? error.message : fallback
	if (message.toLowerCase().includes('memory')) {
		return {
			message:
				'Export failed: the browser ran out of memory. Try a shorter or smaller video.',
			mode: 'error'
		}
	}
	return { message: `Export failed: ${message}`, mode: 'error' }
}

export function useSendableVideoStore() {
	const [file, setFile] = useState<File | null>(null)
	const [fileUrl, setFileUrl] = useState<string | null>(null)
	const trimState = useTrimState()
	const { trim, hasTrim, clear: clearTrim } = trimState
	const [options, setOptions] = useLocalStorage<TPersistedOptions>(
		STORAGE_KEY,
		DEFAULT_OPTIONS
	)
	const [status, setStatus] = useState<TStatus>(IDLE_STATUS)
	const [progress, setProgress] = useState(0)
	const [busy, setBusy] = useState(false)
	const [output, setOutput] = useState<TOutputFile | null>(null)

	const urlsRef = useRef<{ file: string | null; output: string | null }>({
		file: null,
		output: null
	})
	const pendingTrimRef = useRef<TTrimRange | null>(null)
	const restoredRef = useRef(false)

	const { persistFile, persistTrim, persistOutput } = useMediaSession(
		STORAGE_KEY,
		session => {
			if (restoredRef.current) return
			restoredRef.current = true
			pendingTrimRef.current = session.trim
			setFile(session.file)
			setFileUrl(URL.createObjectURL(session.file))
			if (session.output) {
				setOutput({
					url: URL.createObjectURL(session.output.blob),
					name: session.output.name,
					size: session.output.blob.size,
					kind: session.output.mime === 'image/gif' ? 'gif' : 'mp4'
				})
			}
			setStatus({
				message: 'Restored your previous session from this browser.',
				mode: 'idle'
			})
		}
	)

	useEffect(() => {
		urlsRef.current.file = fileUrl
	}, [fileUrl])

	useEffect(() => {
		urlsRef.current.output = output?.url ?? null
	}, [output])

	useEffect(
		() => () => {
			if (urlsRef.current.file) URL.revokeObjectURL(urlsRef.current.file)
			if (urlsRef.current.output)
				URL.revokeObjectURL(urlsRef.current.output)
		},
		[]
	)

	const clearOutput = useCallback(() => {
		persistOutput(null)
		setOutput(previous => {
			if (previous) URL.revokeObjectURL(previous.url)
			return null
		})
	}, [persistOutput])

	const selectFile = useCallback(
		(next: File | null) => {
			if (busy) return

			restoredRef.current = true
			pendingTrimRef.current = null
			clearOutput()
			setFileUrl(previous => {
				if (previous) URL.revokeObjectURL(previous)
				return null
			})
			clearTrim()
			setProgress(0)

			if (!next) {
				persistFile(null)
				setFile(null)
				setStatus(IDLE_STATUS)
				return
			}

			const sizeMb = next.size / (1024 * 1024)
			if (sizeMb > MAX_INPUT_MB) {
				persistFile(null)
				setFile(null)
				setStatus({
					message: `File is ${sizeMb.toFixed(1)} MB. Keep it under ${MAX_INPUT_MB} MB for browser conversion.`,
					mode: 'error'
				})
				return
			}

			persistFile(next)
			setFile(next)
			setFileUrl(URL.createObjectURL(next))
			setStatus({
				message: 'Video loaded. Trim if you want, then export.',
				mode: 'idle'
			})
		},
		[busy, clearOutput, clearTrim, persistFile]
	)

	const handleMetadata = useCallback(
		(nextDuration: number) => {
			trimState.handleMetadata(
				nextDuration,
				pendingTrimRef.current ?? undefined
			)
			pendingTrimRef.current = null
		},
		[trimState.handleMetadata]
	)

	useEffect(() => {
		if (!file || trimState.duration <= 0) return
		const timeout = setTimeout(() => {
			persistTrim(hasTrim ? trim : null)
		}, 300)
		return () => clearTimeout(timeout)
	}, [file, trimState.duration, hasTrim, trim, persistTrim])

	const setMuteAudio = useCallback(
		(muteAudio: boolean) => {
			setOptions(previous => ({ ...previous, muteAudio }))
		},
		[setOptions]
	)

	const setGifFps = useCallback(
		(gifFps: TGifFps) => {
			setOptions(previous => ({ ...previous, gifFps }))
		},
		[setOptions]
	)

	const exportMp4 = useCallback(async () => {
		if (!file || busy) return

		setBusy(true)
		clearOutput()
		setProgress(0)

		try {
			setStatus({
				message: 'Loading the FFmpeg engine in your browser…',
				mode: 'processing'
			})
			const ffmpeg = await loadFFmpeg()
			setFFmpegProgressHandler(ratio => {
				setProgress(Math.max(0, Math.min(100, ratio * 100)))
			})

			setStatus({
				message: 'Loading the source into FFmpeg…',
				mode: 'processing'
			})
			await writeInputFile(ffmpeg, INPUT_NAME, file)
			await deleteQuiet(ffmpeg, OUTPUT_MP4)

			const range = hasTrim ? trim : null
			setStatus({
				message: 'Converting to a sendable MP4…',
				mode: 'processing'
			})

			let blob: Blob | null = null
			if (
				!options.muteAudio &&
				isRemuxCompatible(await probeLogs(ffmpeg, INPUT_NAME))
			) {
				try {
					await execWithLogs(ffmpeg, remuxArgs(range))
					blob = await readOutputBlob(ffmpeg, OUTPUT_MP4, 'video/mp4')
				} catch {
					blob = null
				}
			}

			if (!blob) {
				await deleteQuiet(ffmpeg, OUTPUT_MP4)
				setStatus({
					message: 'Re-encoding for compatibility…',
					mode: 'processing'
				})
				await execWithLogs(ffmpeg, encodeArgs(range, options.muteAudio))
				blob = await readOutputBlob(ffmpeg, OUTPUT_MP4, 'video/mp4')
			}

			const outputName = `${stem(file.name)}_sendable.mp4`
			persistOutput({ blob, name: outputName, mime: 'video/mp4' })
			setOutput({
				url: URL.createObjectURL(blob),
				name: outputName,
				size: blob.size,
				kind: 'mp4'
			})
			setProgress(100)
			setStatus({
				message: 'Done - your MP4 is ready to download.',
				mode: 'success'
			})

			await deleteQuiet(ffmpeg, OUTPUT_MP4)
			await deleteQuiet(ffmpeg, INPUT_NAME)
		} catch (error) {
			setStatus(toErrorStatus(error, 'MP4 export failed.'))
		} finally {
			setFFmpegProgressHandler(noop)
			setBusy(false)
		}
	}, [busy, clearOutput, file, hasTrim, options.muteAudio, persistOutput, trim])

	const exportGif = useCallback(async () => {
		if (!file || busy) return

		setBusy(true)
		clearOutput()
		setProgress(0)

		try {
			setStatus({
				message: 'Loading the FFmpeg engine in your browser…',
				mode: 'processing'
			})
			const ffmpeg = await loadFFmpeg()
			setFFmpegProgressHandler(ratio => {
				setProgress(Math.max(0, Math.min(100, ratio * 100)))
			})

			setStatus({
				message: 'Loading the source into FFmpeg…',
				mode: 'processing'
			})
			await writeInputFile(ffmpeg, INPUT_NAME, file)
			await deleteQuiet(ffmpeg, OUTPUT_GIF)

			const preset = GIF_PRESETS[options.gifFps]
			setStatus({
				message: `Encoding an optimized GIF (${preset.fps} fps)…`,
				mode: 'processing'
			})
			await execWithLogs(ffmpeg, gifArgs(hasTrim ? trim : null, preset))

			const blob = await readOutputBlob(ffmpeg, OUTPUT_GIF, 'image/gif')
			const outputName = `${stem(file.name)}_${preset.fps}fps.gif`
			persistOutput({ blob, name: outputName, mime: 'image/gif' })
			setOutput({
				url: URL.createObjectURL(blob),
				name: outputName,
				size: blob.size,
				kind: 'gif'
			})
			setProgress(100)
			setStatus({
				message: 'Done - your GIF is ready to download.',
				mode: 'success'
			})

			await deleteQuiet(ffmpeg, OUTPUT_GIF)
			await deleteQuiet(ffmpeg, INPUT_NAME)
		} catch (error) {
			setStatus(toErrorStatus(error, 'GIF export failed.'))
		} finally {
			setFFmpegProgressHandler(noop)
			setBusy(false)
		}
	}, [busy, clearOutput, file, hasTrim, options.gifFps, persistOutput, trim])

	return {
		file,
		fileUrl,
		duration: trimState.duration,
		trim,
		hasTrim,
		canUndoTrim: trimState.canUndoTrim,
		options,
		status,
		progress,
		busy,
		output,
		selectFile,
		handleMetadata,
		updateTrim: trimState.updateTrim,
		commitTrim: trimState.commitTrim,
		undoTrim: trimState.undoTrim,
		resetTrim: trimState.resetTrim,
		setMuteAudio,
		setGifFps,
		exportMp4,
		exportGif
	}
}

export type TSendableVideoStore = ReturnType<typeof useSendableVideoStore>

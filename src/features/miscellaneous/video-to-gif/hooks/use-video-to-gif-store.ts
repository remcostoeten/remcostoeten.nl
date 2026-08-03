'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { noop } from '@/shared/lib/noop'
import { useLocalStorage } from '../../hooks/use-local-storage'
import { useMediaSession } from '../../hooks/use-media-session'
import { useTrimState } from '../../hooks/use-trim-state'
import type {
	TMediaOutput,
	TMediaStatus,
	TTrimRange
} from '../../types/media'
import {
	deleteQuiet,
	execWithLogs,
	loadFFmpeg,
	readOutputBlob,
	setFFmpegProgressHandler,
	writeInputFile
} from '../../utils/ffmpeg'
import { stem } from '../../utils/format'
import {
	DEFAULT_OPTIONS,
	INPUT_NAME,
	MAX_INPUT_MB,
	OUTPUT_NAME,
	PREVIEW_NAME,
	PREVIEW_SECONDS,
	STORAGE_KEY
} from '../constants'
import type {
	TGifFps,
	TGifPreview,
	TGifQuality,
	TGifWidth,
	TPersistedOptions
} from '../types'
import { convertArgs, previewArgs } from '../utils/args'

const IDLE_STATUS: TMediaStatus = {
	message: 'Select a video to get started.',
	mode: 'idle'
}

function toErrorStatus(error: unknown, fallback: string): TMediaStatus {
	const message = error instanceof Error ? error.message : fallback
	if (message.toLowerCase().includes('memory')) {
		return {
			message:
				'Conversion failed: the browser ran out of memory. Try a shorter or smaller video.',
			mode: 'error'
		}
	}
	return { message: `Conversion failed: ${message}`, mode: 'error' }
}

export function useVideoToGifStore() {
	const [file, setFile] = useState<File | null>(null)
	const [fileUrl, setFileUrl] = useState<string | null>(null)
	const trimState = useTrimState()
	const { trim, duration, hasTrim, clear: clearTrim } = trimState
	const [options, setOptions] = useLocalStorage<TPersistedOptions>(
		STORAGE_KEY,
		DEFAULT_OPTIONS
	)
	const [status, setStatus] = useState<TMediaStatus>(IDLE_STATUS)
	const [progress, setProgress] = useState(0)
	const [busy, setBusy] = useState(false)
	const [preview, setPreview] = useState<TGifPreview | null>(null)
	const [output, setOutput] = useState<TMediaOutput | null>(null)

	const inputWrittenFor = useRef<File | null>(null)
	const urlsRef = useRef<string[]>([])
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
					mime: session.output.mime
				})
			}
			setStatus({
				message: 'Restored your previous session from this browser.',
				mode: 'idle'
			})
		}
	)

	useEffect(() => {
		urlsRef.current = [fileUrl, preview?.url, output?.url].filter(
			(url): url is string => !!url
		)
	}, [fileUrl, preview, output])

	useEffect(
		() => () => {
			for (const url of urlsRef.current) URL.revokeObjectURL(url)
		},
		[]
	)

	const clearPreview = useCallback(() => {
		setPreview(previous => {
			if (previous) URL.revokeObjectURL(previous.url)
			return null
		})
	}, [])

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
			clearPreview()
			clearOutput()
			inputWrittenFor.current = null
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
				message:
					'Video loaded. Tune the settings, preview, then convert.',
				mode: 'idle'
			})
		},
		[busy, clearOutput, clearPreview, clearTrim, persistFile]
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
		if (!file || duration <= 0) return
		const timeout = setTimeout(() => {
			persistTrim(hasTrim ? trim : null)
		}, 300)
		return () => clearTimeout(timeout)
	}, [file, duration, hasTrim, trim, persistTrim])

	const updateTrim = useCallback(
		(next: TTrimRange) => {
			trimState.updateTrim(next)
			clearPreview()
		},
		[clearPreview, trimState]
	)

	const undoTrim = useCallback(() => {
		trimState.undoTrim()
		clearPreview()
	}, [clearPreview, trimState])

	const resetTrim = useCallback(() => {
		trimState.resetTrim()
		clearPreview()
	}, [clearPreview, trimState])

	const changeOptions = useCallback(
		(patch: Partial<TPersistedOptions>) => {
			setOptions(previous => ({ ...previous, ...patch }))
			clearPreview()
		},
		[clearPreview, setOptions]
	)

	const setFps = useCallback(
		(fps: TGifFps) => changeOptions({ fps }),
		[changeOptions]
	)

	const setWidth = useCallback(
		(width: TGifWidth) => changeOptions({ width }),
		[changeOptions]
	)

	const setQuality = useCallback(
		(quality: TGifQuality) => changeOptions({ quality }),
		[changeOptions]
	)

	const ensureInputWritten = useCallback(async () => {
		if (!file) throw new Error('No file selected.')
		const ffmpeg = await loadFFmpeg()
		if (inputWrittenFor.current !== file) {
			setStatus({
				message: 'Loading the source into FFmpeg…',
				mode: 'processing'
			})
			await writeInputFile(ffmpeg, INPUT_NAME, file)
			inputWrittenFor.current = file
		}
		return ffmpeg
	}, [file])

	const generatePreview = useCallback(async () => {
		if (!file || busy) return

		setBusy(true)
		clearPreview()
		setProgress(0)

		try {
			setStatus({
				message: 'Loading the FFmpeg engine in your browser…',
				mode: 'processing'
			})
			const ffmpeg = await ensureInputWritten()
			setFFmpegProgressHandler(ratio => {
				setProgress(Math.max(0, Math.min(100, ratio * 100)))
			})

			const range = hasTrim ? trim : null
			const selectedLength = range ? range.end - range.start : duration
			const seconds =
				selectedLength > 0
					? Math.min(PREVIEW_SECONDS, selectedLength)
					: PREVIEW_SECONDS
			setStatus({
				message: `Rendering a ${seconds.toFixed(1)}s preview…`,
				mode: 'processing'
			})
			await deleteQuiet(ffmpeg, PREVIEW_NAME)
			await execWithLogs(
				ffmpeg,
				previewArgs(options, range, seconds, PREVIEW_NAME)
			)

			const blob = await readOutputBlob(ffmpeg, PREVIEW_NAME, 'image/gif')
			setPreview({
				url: URL.createObjectURL(blob),
				size: blob.size,
				seconds
			})
			setStatus({
				message:
					'Preview ready. Tweak the settings or convert the full clip.',
				mode: 'success'
			})

			await deleteQuiet(ffmpeg, PREVIEW_NAME)
		} catch (error) {
			setStatus(toErrorStatus(error, 'Preview failed.'))
		} finally {
			setFFmpegProgressHandler(noop)
			setBusy(false)
		}
	}, [
		busy,
		clearPreview,
		duration,
		ensureInputWritten,
		file,
		hasTrim,
		options,
		trim
	])

	const convert = useCallback(async () => {
		if (!file || busy) return

		setBusy(true)
		clearOutput()
		setProgress(0)

		try {
			setStatus({
				message: 'Loading the FFmpeg engine in your browser…',
				mode: 'processing'
			})
			const ffmpeg = await ensureInputWritten()
			setFFmpegProgressHandler(ratio => {
				setProgress(Math.max(0, Math.min(100, ratio * 100)))
			})

			setStatus({
				message: `Encoding GIF (${options.fps} fps, ${options.width === 'original' ? 'original width' : `${options.width}px`})…`,
				mode: 'processing'
			})
			await deleteQuiet(ffmpeg, OUTPUT_NAME)
			await execWithLogs(
				ffmpeg,
				convertArgs(options, hasTrim ? trim : null, OUTPUT_NAME)
			)

			const blob = await readOutputBlob(ffmpeg, OUTPUT_NAME, 'image/gif')
			const outputName = `${stem(file.name)}_${options.fps}fps.gif`
			persistOutput({ blob, name: outputName, mime: 'image/gif' })
			setOutput({
				url: URL.createObjectURL(blob),
				name: outputName,
				size: blob.size,
				mime: 'image/gif'
			})
			setProgress(100)
			setStatus({
				message: 'Done — your GIF is ready to download.',
				mode: 'success'
			})

			await deleteQuiet(ffmpeg, OUTPUT_NAME)
		} catch (error) {
			setStatus(toErrorStatus(error, 'GIF conversion failed.'))
		} finally {
			setFFmpegProgressHandler(noop)
			setBusy(false)
		}
	}, [
		busy,
		clearOutput,
		ensureInputWritten,
		file,
		hasTrim,
		options,
		persistOutput,
		trim
	])

	const effectiveDuration = hasTrim ? trim.end - trim.start : duration
	const estimatedSize =
		preview && effectiveDuration > 0 && preview.seconds > 0
			? preview.size * (effectiveDuration / preview.seconds)
			: null

	return {
		file,
		fileUrl,
		duration,
		trim,
		hasTrim,
		canUndoTrim: trimState.canUndoTrim,
		options,
		status,
		progress,
		busy,
		preview,
		output,
		estimatedSize,
		selectFile,
		handleMetadata,
		updateTrim,
		commitTrim: trimState.commitTrim,
		undoTrim,
		resetTrim,
		setFps,
		setWidth,
		setQuality,
		generatePreview,
		convert
	}
}

export type TVideoToGifStore = ReturnType<typeof useVideoToGifStore>

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { noop } from '@/shared/lib/noop'
import { useLocalStorage } from '../../hooks/use-local-storage'
import { useTrimState } from '../../hooks/use-trim-state'
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
	readOutputBlob,
	setFFmpegProgressHandler,
	writeInputFile
} from '../../utils/ffmpeg'
import { stem } from '../../utils/format'
import { encodeArgs, gifArgs, remuxArgs } from '../utils/ffmpeg'

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
		setOutput(previous => {
			if (previous) URL.revokeObjectURL(previous.url)
			return null
		})
	}, [])

	const selectFile = useCallback(
		(next: File | null) => {
			if (busy) return

			clearOutput()
			setFileUrl(previous => {
				if (previous) URL.revokeObjectURL(previous)
				return null
			})
			clearTrim()
			setProgress(0)

			if (!next) {
				setFile(null)
				setStatus(IDLE_STATUS)
				return
			}

			const sizeMb = next.size / (1024 * 1024)
			if (sizeMb > MAX_INPUT_MB) {
				setFile(null)
				setStatus({
					message: `File is ${sizeMb.toFixed(1)} MB. Keep it under ${MAX_INPUT_MB} MB for browser conversion.`,
					mode: 'error'
				})
				return
			}

			setFile(next)
			setFileUrl(URL.createObjectURL(next))
			setStatus({
				message: 'Video loaded. Trim if you want, then export.',
				mode: 'idle'
			})
		},
		[busy, clearOutput, clearTrim]
	)

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
			if (!options.muteAudio) {
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
				await execWithLogs(
					ffmpeg,
					encodeArgs(range, options.muteAudio)
				)
				blob = await readOutputBlob(ffmpeg, OUTPUT_MP4, 'video/mp4')
			}

			setOutput({
				url: URL.createObjectURL(blob),
				name: `${stem(file.name)}_sendable.mp4`,
				size: blob.size,
				kind: 'mp4'
			})
			setProgress(100)
			setStatus({
				message: 'Done — your MP4 is ready to download.',
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
	}, [busy, clearOutput, file, hasTrim, options.muteAudio, trim])

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
			setOutput({
				url: URL.createObjectURL(blob),
				name: `${stem(file.name)}_${preset.fps}fps.gif`,
				size: blob.size,
				kind: 'gif'
			})
			setProgress(100)
			setStatus({
				message: 'Done — your GIF is ready to download.',
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
	}, [busy, clearOutput, file, hasTrim, options.gifFps, trim])

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
		handleMetadata: trimState.handleMetadata,
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

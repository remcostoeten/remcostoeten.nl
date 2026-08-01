'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { noop } from '@/shared/lib/noop'
import { useLocalStorage } from '../../hooks/use-local-storage'
import { useMediaSession } from '../../hooks/use-media-session'
import type { TMediaOutput, TMediaStatus } from '../../types/media'
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
	OUTPUT_MIMES,
	OUTPUT_NAMES,
	STORAGE_KEY
} from '../constants'
import type {
	TPersistedOptions,
	TVideoFormat,
	TVideoQuality
} from '../types'
import { convertArgs } from '../utils/args'

const IDLE_STATUS: TMediaStatus = {
	message: 'Select a GIF to get started.',
	mode: 'idle'
}

function toErrorStatus(error: unknown, fallback: string): TMediaStatus {
	const message = error instanceof Error ? error.message : fallback
	if (message.toLowerCase().includes('memory')) {
		return {
			message:
				'Conversion failed: the browser ran out of memory. Try a smaller GIF.',
			mode: 'error'
		}
	}
	return { message: `Conversion failed: ${message}`, mode: 'error' }
}

export function useGifToVideoStore() {
	const [file, setFile] = useState<File | null>(null)
	const [fileUrl, setFileUrl] = useState<string | null>(null)
	const [options, setOptions] = useLocalStorage<TPersistedOptions>(
		STORAGE_KEY,
		DEFAULT_OPTIONS
	)
	const [status, setStatus] = useState<TMediaStatus>(IDLE_STATUS)
	const [progress, setProgress] = useState(0)
	const [busy, setBusy] = useState(false)
	const [output, setOutput] = useState<TMediaOutput | null>(null)

	const urlsRef = useRef<string[]>([])
	const restoredRef = useRef(false)

	const { persistFile, persistOutput } = useMediaSession(
		STORAGE_KEY,
		session => {
			if (restoredRef.current) return
			restoredRef.current = true
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
		urlsRef.current = [fileUrl, output?.url].filter(
			(url): url is string => !!url
		)
	}, [fileUrl, output])

	useEffect(
		() => () => {
			for (const url of urlsRef.current) URL.revokeObjectURL(url)
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
			clearOutput()
			setFileUrl(previous => {
				if (previous) URL.revokeObjectURL(previous)
				return null
			})
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
				message: 'GIF loaded. Pick a format and convert.',
				mode: 'idle'
			})
		},
		[busy, clearOutput, persistFile]
	)

	const setFormat = useCallback(
		(format: TVideoFormat) => {
			setOptions(previous => ({ ...previous, format }))
		},
		[setOptions]
	)

	const setQuality = useCallback(
		(quality: TVideoQuality) => {
			setOptions(previous => ({ ...previous, quality }))
		},
		[setOptions]
	)

	const convert = useCallback(async () => {
		if (!file || busy) return

		setBusy(true)
		clearOutput()
		setProgress(0)

		const outputName = OUTPUT_NAMES[options.format]

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
				message: 'Loading the GIF into FFmpeg…',
				mode: 'processing'
			})
			await writeInputFile(ffmpeg, INPUT_NAME, file)
			await deleteQuiet(ffmpeg, outputName)

			setStatus({
				message: `Encoding ${options.format.toUpperCase()} (${options.quality})…`,
				mode: 'processing'
			})
			await execWithLogs(ffmpeg, convertArgs(options))

			const blob = await readOutputBlob(
				ffmpeg,
				outputName,
				OUTPUT_MIMES[options.format]
			)
			const outputFileName = `${stem(file.name)}.${options.format}`
			persistOutput({
				blob,
				name: outputFileName,
				mime: OUTPUT_MIMES[options.format]
			})
			setOutput({
				url: URL.createObjectURL(blob),
				name: outputFileName,
				size: blob.size,
				mime: OUTPUT_MIMES[options.format]
			})
			setProgress(100)
			setStatus({
				message: 'Done — your video is ready to download.',
				mode: 'success'
			})

			await deleteQuiet(ffmpeg, outputName)
			await deleteQuiet(ffmpeg, INPUT_NAME)
		} catch (error) {
			setStatus(toErrorStatus(error, 'Video conversion failed.'))
		} finally {
			setFFmpegProgressHandler(noop)
			setBusy(false)
		}
	}, [busy, clearOutput, file, options, persistOutput])

	return {
		file,
		fileUrl,
		options,
		status,
		progress,
		busy,
		output,
		selectFile,
		setFormat,
		setQuality,
		convert
	}
}

export type TGifToVideoStore = ReturnType<typeof useGifToVideoStore>

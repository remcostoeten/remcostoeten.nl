'use client'

import { useEffect, useRef, useState } from 'react'
import {
	Check,
	Download,
	ImageIcon,
	Images,
	Loader2,
	ShieldCheck,
	Trash2,
	Upload,
	Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { Segmented } from '../link-extractor/components/segmented'
import { bytesToHuman } from '../utils/format'
import {
	ACCEPTED_INPUT,
	DEFAULT_QUALITY,
	FORMAT_OPTIONS,
	MAX_FILES
} from './constants'
import type { TConvertedImage, TImageFormat } from './types'
import { outputMime, outputName, validateHeicFile } from './utils'

type TStatus = {
	mode: 'idle' | 'processing' | 'success' | 'error'
	message: string
}

const IDLE_STATUS: TStatus = {
	mode: 'idle',
	message: 'Choose HEIC photos to get started.'
}

function download(result: TConvertedImage) {
	const anchor = document.createElement('a')
	anchor.href = result.url
	anchor.download = result.name
	document.body.append(anchor)
	anchor.click()
	anchor.remove()
}

export default function HeicConverter() {
	const [files, setFiles] = useState<File[]>([])
	const [format, setFormat] = useState<TImageFormat>('jpeg')
	const [quality, setQuality] = useState(DEFAULT_QUALITY)
	const [results, setResults] = useState<TConvertedImage[]>([])
	const [status, setStatus] = useState<TStatus>(IDLE_STATUS)
	const [busy, setBusy] = useState(false)
	const [dragging, setDragging] = useState(false)
	const [completed, setCompleted] = useState(0)
	const resultsRef = useRef<TConvertedImage[]>([])

	useEffect(() => {
		resultsRef.current = results
	}, [results])

	useEffect(
		() => () => {
			for (const result of resultsRef.current) {
				URL.revokeObjectURL(result.url)
			}
		},
		[]
	)

	function clearResults() {
		for (const result of resultsRef.current) URL.revokeObjectURL(result.url)
		resultsRef.current = []
		setResults([])
		setCompleted(0)
	}

	function selectFiles(selected: FileList | File[]) {
		if (busy) return
		const incoming = Array.from(selected).slice(0, MAX_FILES)
		const invalid = incoming
			.map(validateHeicFile)
			.find((message): message is string => message !== null)

		clearResults()
		if (invalid) {
			setFiles([])
			setStatus({ mode: 'error', message: invalid })
			return
		}
		if (incoming.length === 0) {
			setFiles([])
			setStatus(IDLE_STATUS)
			return
		}

		setFiles(incoming)
		setStatus({
			mode: 'idle',
			message:
				incoming.length === 1
					? 'Photo ready to convert.'
					: `${incoming.length} photos ready to convert.`
		})
	}

	function changeFormat(next: TImageFormat) {
		if (busy || next === format) return
		clearResults()
		setFormat(next)
		if (files.length > 0) {
			setStatus({
				mode: 'idle',
				message: `Ready to convert to ${next === 'jpeg' ? 'JPG' : 'PNG'}.`
			})
		}
	}

	async function convert() {
		if (busy || files.length === 0) return
		setBusy(true)
		clearResults()
		setStatus({ mode: 'processing', message: 'Loading the HEIC decoder…' })

		try {
			const { default: heic2any } = await import('heic2any')
			const convertedResults: TConvertedImage[] = []

			for (const [fileIndex, file] of files.entries()) {
				setStatus({
					mode: 'processing',
					message: `Converting ${file.name} (${fileIndex + 1} of ${files.length})…`
				})
				const converted = await heic2any({
					blob: file,
					toType: outputMime(format),
					quality: format === 'jpeg' ? quality : undefined
				})
				const blobs = Array.isArray(converted) ? converted : [converted]

				for (const [imageIndex, blob] of blobs.entries()) {
					const hasMultipleImages = blobs.length > 1
					convertedResults.push({
						id: `${file.name}-${file.lastModified}-${imageIndex}`,
						name: outputName(
							file.name,
							format,
							hasMultipleImages ? imageIndex : undefined
						),
						url: URL.createObjectURL(blob),
						size: blob.size,
						sourceName: file.name
					})
					resultsRef.current = convertedResults
				}
				setCompleted(fileIndex + 1)
			}

			resultsRef.current = convertedResults
			setResults(convertedResults)
			setStatus({
				mode: 'success',
				message:
					convertedResults.length === 1
						? 'Done — your image is ready to download.'
						: `Done — ${convertedResults.length} images are ready to download.`
			})
		} catch (error) {
			for (const result of resultsRef.current)
				URL.revokeObjectURL(result.url)
			resultsRef.current = []
			setResults([])
			setStatus({
				mode: 'error',
				message:
					error instanceof Error &&
					error.message.toLowerCase().includes('memory')
						? 'The browser ran out of memory. Try fewer or smaller photos.'
						: 'This file could not be decoded. Check that it is a valid HEIC or HEIF photo.'
			})
		} finally {
			setBusy(false)
		}
	}

	const progress = files.length > 0 ? (completed / files.length) * 100 : 0

	return (
		<div className="flex flex-col gap-3">
			<label
				onDragOver={event => {
					event.preventDefault()
					if (!busy) setDragging(true)
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={event => {
					event.preventDefault()
					setDragging(false)
					selectFiles(event.dataTransfer.files)
				}}
				className={cn(
					'group grid min-h-44 cursor-pointer place-items-center border border-dashed border-border/60 bg-card px-5 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-muted/30',
					dragging && 'border-ring bg-muted/50',
					busy && 'cursor-not-allowed opacity-60'
				)}
			>
				<input
					type="file"
					multiple
					accept={ACCEPTED_INPUT}
					disabled={busy}
					aria-label="Select HEIC photos"
					className="sr-only"
					onChange={event => {
						if (event.target.files) selectFiles(event.target.files)
						event.target.value = ''
					}}
				/>
				<div className="flex max-w-md flex-col items-center gap-2">
					<div className="relative grid size-11 place-items-center rounded-full border border-border/60 bg-background">
						<Images
							aria-hidden
							className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5"
						/>
						<Upload
							aria-hidden
							className="absolute -bottom-1 -right-1 size-4 rounded-full bg-foreground p-0.5 text-background"
						/>
					</div>
					<div>
						<p className="text-sm font-medium text-foreground">
							{files.length > 0
								? `${files.length} ${files.length === 1 ? 'photo' : 'photos'} selected`
								: 'Drop HEIC photos here'}
						</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							{files.length > 0
								? 'Click or drop to replace your selection'
								: `or click to choose up to ${MAX_FILES} files`}
						</p>
					</div>
					<span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
						<ShieldCheck aria-hidden className="size-3" />
						Processed locally — no uploads
					</span>
				</div>
			</label>

			<section
				aria-label="Conversion settings"
				className="border border-border/50 bg-card"
			>
				<div className="flex flex-wrap items-center gap-x-5 gap-y-3 p-3">
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">
							Format
						</span>
						<Segmented
							label="Output format"
							value={format}
							options={FORMAT_OPTIONS}
							onChange={changeFormat}
						/>
					</div>
					{format === 'jpeg' ? (
						<label className="flex min-w-52 grow items-center gap-2 text-xs text-muted-foreground sm:max-w-xs">
							Quality
							<input
								type="range"
								min={0.5}
								max={1}
								step={0.05}
								value={quality}
								disabled={busy}
								onChange={event => {
									clearResults()
									setQuality(Number(event.target.value))
									setStatus({
										mode: 'idle',
										message:
											'Quality changed. Ready to convert again.'
									})
								}}
								className="h-1 grow accent-foreground"
							/>
							<output className="w-8 text-right text-foreground">
								{Math.round(quality * 100)}%
							</output>
						</label>
					) : (
						<p className="text-xs text-muted-foreground">
							PNG is lossless and usually much larger than JPG.
						</p>
					)}
				</div>

				{files.length > 0 ? (
					<div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-3 py-2">
						<Button
							size="sm"
							className="h-8 gap-1.5 text-xs"
							disabled={busy}
							onClick={() => void convert()}
						>
							{busy ? (
								<Loader2
									aria-hidden
									className="size-3.5 animate-spin"
								/>
							) : (
								<Wand2 aria-hidden className="size-3.5" />
							)}
							Convert{' '}
							{files.length === 1
								? 'photo'
								: `${files.length} photos`}
						</Button>
						{results.length > 1 ? (
							<Button
								size="sm"
								variant="outline"
								className="h-8 gap-1.5 text-xs"
								onClick={() => results.forEach(download)}
							>
								<Download aria-hidden className="size-3.5" />
								Download all
							</Button>
						) : null}
						<Button
							size="sm"
							variant="ghost"
							className="ml-auto h-8 gap-1.5 text-xs text-muted-foreground"
							disabled={busy}
							onClick={() => selectFiles([])}
						>
							<Trash2 aria-hidden className="size-3.5" />
							Clear
						</Button>
					</div>
				) : null}
			</section>

			{busy ? (
				<div
					role="progressbar"
					aria-label="Conversion progress"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(progress)}
					className="h-1 overflow-hidden bg-muted/60"
				>
					<div
						className="h-full bg-foreground transition-[width] duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			) : null}

			<p
				aria-live="polite"
				role={status.mode === 'error' ? 'alert' : undefined}
				className={cn(
					'flex items-center gap-1.5 text-xs',
					status.mode === 'error'
						? 'text-destructive'
						: status.mode === 'success'
							? 'text-foreground'
							: 'text-muted-foreground'
				)}
			>
				{status.mode === 'success' ? (
					<Check aria-hidden className="size-3.5" />
				) : null}
				{status.message}
			</p>

			{results.length > 0 ? (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{results.map(result => (
						<figure
							key={result.id}
							className="group overflow-hidden border border-border/50 bg-card"
						>
							<div className="grid aspect-[4/3] place-items-center overflow-hidden bg-muted/30">
								<img
									src={result.url}
									alt={`Converted preview of ${result.sourceName}`}
									className="h-full w-full object-contain"
								/>
							</div>
							<figcaption className="flex items-center gap-2 border-t border-border/50 p-2">
								<ImageIcon
									aria-hidden
									className="size-4 shrink-0 text-muted-foreground"
								/>
								<div className="min-w-0 grow">
									<p className="truncate text-xs text-foreground">
										{result.name}
									</p>
									<p className="text-[11px] text-muted-foreground">
										{bytesToHuman(result.size)}
									</p>
								</div>
								<Button
									size="icon"
									variant="ghost"
									className="size-8 shrink-0"
									aria-label={`Download ${result.name}`}
									onClick={() => download(result)}
								>
									<Download aria-hidden className="size-4" />
								</Button>
							</figcaption>
						</figure>
					))}
				</div>
			) : null}

			<p className="text-[11px] text-muted-foreground">
				Converted images do not retain EXIF metadata such as camera
				details or location.
			</p>
		</div>
	)
}

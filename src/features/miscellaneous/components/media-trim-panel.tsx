'use client'

import './media-trim-panel.css'
import { useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TTrimRange } from '../types/media'
import { formatRange, formatSeconds } from '../utils/format'

type Props = {
	fileUrl: string
	trim: TTrimRange
	duration: number
	canUndo: boolean
	onMetadata: (duration: number) => void
	onChange: (trim: TTrimRange) => void
	onCommit: () => void
	onUndo: () => void
	onReset: () => void
}

export function MediaTrimPanel({
	fileUrl,
	trim,
	duration,
	canUndo,
	onMetadata,
	onChange,
	onCommit,
	onUndo,
	onReset
}: Props) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [previewing, setPreviewing] = useState(false)

	const leftPct = duration > 0 ? (trim.start / duration) * 100 : 0
	const keepPct =
		duration > 0 ? ((trim.end - trim.start) / duration) * 100 : 100
	const selectedLength = Math.max(0, trim.end - trim.start)
	const isFullSelection =
		duration > 0 && trim.start <= 0.01 && trim.end >= duration - 0.01

	function seekTo(time: number): void {
		const video = videoRef.current
		if (video) video.currentTime = time
	}

	function togglePreview(): void {
		const video = videoRef.current
		if (!video) return

		if (!video.paused) {
			video.pause()
			setPreviewing(false)
			return
		}

		video.currentTime = trim.start
		void video.play()
		setPreviewing(true)
	}

	return (
		<section
			aria-label="Trim"
			className="flex flex-col gap-3 border border-border/50 bg-card p-3"
		>
			<header className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-col">
					<p className="text-sm text-foreground">
						Trim your clip (optional)
					</p>
					<p className="text-xs text-muted-foreground">
						Drag the two handles to keep only the part you want.
					</p>
				</div>
				<p className="text-xs tabular-nums text-muted-foreground">
					Start: {formatSeconds(trim.start)} | End:{' '}
					{formatSeconds(trim.end)}
				</p>
			</header>

			<video
				ref={videoRef}
				src={fileUrl}
				playsInline
				controls
				className="max-h-80 w-full bg-black/40"
				onLoadedMetadata={event =>
					onMetadata(event.currentTarget.duration)
				}
				onPause={() => setPreviewing(false)}
				onTimeUpdate={event => {
					const video = event.currentTarget
					if (!previewing) return
					if (video.currentTime >= trim.end) {
						video.pause()
						video.currentTime = trim.end
						setPreviewing(false)
					}
				}}
			/>

			<div className="media-trim relative h-10 overflow-hidden rounded-sm bg-muted/60">
				<div
					aria-hidden
					className="absolute inset-y-0 bg-accent/70"
					style={{ left: `${leftPct}%`, width: `${keepPct}%` }}
				/>
				<input
					type="range"
					className="media-trim-handle"
					min={0}
					max={duration}
					step={0.01}
					value={trim.start}
					disabled={duration <= 0}
					aria-label="Trim start"
					aria-valuetext={formatSeconds(trim.start)}
					onChange={event => {
						const start = Number(event.target.value)
						onChange({ start, end: trim.end })
						seekTo(start)
					}}
					onPointerUp={() => onCommit()}
					onKeyUp={() => onCommit()}
				/>
				<input
					type="range"
					className="media-trim-handle"
					min={0}
					max={duration}
					step={0.01}
					value={trim.end}
					disabled={duration <= 0}
					aria-label="Trim end"
					aria-valuetext={formatSeconds(trim.end)}
					onChange={event => {
						const end = Number(event.target.value)
						onChange({ start: trim.start, end })
						seekTo(end)
					}}
					onPointerUp={() => onCommit()}
					onKeyUp={() => onCommit()}
				/>
			</div>

			<p aria-live="polite" className="text-xs text-muted-foreground">
				{duration <= 0
					? 'The browser cannot preview this codec, so trimming is unavailable. Converting still processes the whole clip.'
					: isFullSelection
						? 'Full clip selected. The whole video will be processed.'
						: `Keeps ${formatRange(trim.start, trim.end)} — ${formatSeconds(selectedLength)} (${((selectedLength / duration) * 100).toFixed(0)}% of source).`}
			</p>

			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs"
					disabled={duration <= 0}
					onClick={togglePreview}
				>
					{previewing ? (
						<Pause aria-hidden className="size-3.5" />
					) : (
						<Play aria-hidden className="size-3.5" />
					)}
					{previewing ? 'Pause preview' : 'Preview selection'}
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs"
					disabled={!canUndo}
					onClick={() => onUndo()}
				>
					<Undo2 aria-hidden className="size-3.5" />
					Undo trim
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs"
					disabled={isFullSelection || duration <= 0}
					onClick={() => onReset()}
				>
					<RotateCcw aria-hidden className="size-3.5" />
					Reset trim
				</Button>
			</div>
		</section>
	)
}

'use client'

import { Download, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { Segmented } from '../../link-extractor/components/segmented'
import { FORMAT_OPTIONS, QUALITY_OPTIONS } from '../constants'
import type { TGifToVideoStore } from '../hooks/use-gif-to-video-store'
import { bytesToHuman } from '../../utils/format'

type Props = {
	store: TGifToVideoStore
}

export function ConvertPanel({ store }: Props) {
	const { busy, file, options, output, progress, status } = store
	const savedPct =
		file && output && file.size > 0
			? Math.round((1 - output.size / file.size) * 100)
			: null

	return (
		<section
			aria-label="Convert"
			className="flex flex-col gap-3 border border-border/50 bg-card p-3"
		>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						Format
					</span>
					<Segmented
						label="Output format"
						value={options.format}
						options={FORMAT_OPTIONS}
						onChange={value => store.setFormat(value)}
					/>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						Quality
					</span>
					<Segmented
						label="Quality"
						value={options.quality}
						options={QUALITY_OPTIONS}
						onChange={value => store.setQuality(value)}
					/>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Button
					size="sm"
					className="h-8 gap-1.5 text-xs"
					disabled={!file || busy}
					onClick={() => void store.convert()}
				>
					{busy ? (
						<Loader2
							aria-hidden
							className="size-3.5 animate-spin"
						/>
					) : (
						<Wand2 aria-hidden className="size-3.5" />
					)}
					Convert to {options.format.toUpperCase()}
				</Button>
				{output ? (
					<Button
						asChild
						size="sm"
						variant="outline"
						className="h-8 gap-1.5 text-xs"
					>
						<a href={output.url} download={output.name}>
							<Download aria-hidden className="size-3.5" />
							Download {output.name} ({bytesToHuman(output.size)}
							)
						</a>
					</Button>
				) : null}
			</div>

			{output ? (
				<figure className="flex flex-col gap-1">
					<video
						src={output.url}
						playsInline
						controls
						autoPlay
						muted
						loop
						className="max-h-72 w-fit max-w-full border border-border/50 bg-black/40"
					/>
					<figcaption className="text-xs text-muted-foreground">
						{file
							? `${bytesToHuman(file.size)} GIF → ${bytesToHuman(output.size)} ${options.format.toUpperCase()}`
							: bytesToHuman(output.size)}
						{savedPct !== null && savedPct > 0
							? ` (${savedPct}% smaller)`
							: ''}
					</figcaption>
				</figure>
			) : null}

			{busy ? (
				<div
					role="progressbar"
					aria-label="Conversion progress"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(progress)}
					className="h-1 w-full overflow-hidden rounded-sm bg-muted/60"
				>
					<div
						className="h-full bg-foreground transition-[width] duration-200"
						style={{ width: `${progress}%` }}
					/>
				</div>
			) : null}

			<p
				aria-live="polite"
				role={status.mode === 'error' ? 'alert' : undefined}
				className={cn(
					'text-xs',
					status.mode === 'error'
						? 'text-destructive'
						: status.mode === 'success'
							? 'text-foreground'
							: 'text-muted-foreground'
				)}
			>
				{status.message}
			</p>
		</section>
	)
}

'use client'

import { Download, Eye, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { TVideoToGifStore } from '../hooks/use-video-to-gif-store'
import { bytesToHuman } from '../../utils/format'

type Props = {
	store: TVideoToGifStore
}

export function ConvertPanel({ store }: Props) {
	const { busy, estimatedSize, output, preview, progress, status } = store
	const canRun = store.file !== null && !busy

	return (
		<section
			aria-label="Preview and convert"
			className="flex flex-col gap-3 border border-border/50 bg-card p-3"
		>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					size="sm"
					variant="secondary"
					className="h-8 gap-1.5 text-xs"
					disabled={!canRun}
					onClick={() => void store.generatePreview()}
				>
					{busy ? (
						<Loader2
							aria-hidden
							className="size-3.5 animate-spin"
						/>
					) : (
						<Eye aria-hidden className="size-3.5" />
					)}
					Preview first seconds
				</Button>
				<Button
					size="sm"
					className="h-8 gap-1.5 text-xs"
					disabled={!canRun}
					onClick={() => void store.convert()}
				>
					<Wand2 aria-hidden className="size-3.5" />
					Convert to GIF
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

			{preview && !output ? (
				<figure className="flex flex-col gap-1">
					<img
						src={preview.url}
						alt={`GIF preview of the first ${preview.seconds.toFixed(1)} seconds`}
						className="max-h-72 w-fit max-w-full border border-border/50"
					/>
					<figcaption className="text-xs text-muted-foreground">
						{preview.seconds.toFixed(1)}s sample:{' '}
						{bytesToHuman(preview.size)}
						{estimatedSize !== null
							? ` — full clip ≈ ${bytesToHuman(estimatedSize)}`
							: ''}
					</figcaption>
				</figure>
			) : null}

			{output ? (
				<figure className="flex flex-col gap-1">
					<img
						src={output.url}
						alt="Converted GIF result"
						className="max-h-96 w-fit max-w-full border border-border/50"
					/>
					<figcaption className="text-xs text-muted-foreground">
						{output.name} — {bytesToHuman(output.size)}
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

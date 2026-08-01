'use client'

import { Download, Film, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { Segmented, ToggleChip } from '../../link-extractor/components/segmented'
import { GIF_FPS_OPTIONS } from '../constants'
import type { TSendableVideoStore } from '../hooks/use-sendable-video-store'
import { bytesToHuman } from '../../utils/format'

type Props = {
	store: TSendableVideoStore
}

export function ExportPanel({ store }: Props) {
	const { busy, options, output, progress, status } = store
	const canExport = store.file !== null && !busy

	return (
		<section
			aria-label="Export"
			className="flex flex-col gap-3 border border-border/50 bg-card p-3"
		>
			<div className="flex flex-wrap items-center gap-2">
				<ToggleChip
					pressed={options.muteAudio}
					label="Mute audio"
					hint="Strip the audio track from the MP4 export"
					onToggle={() => store.setMuteAudio(!options.muteAudio)}
				/>
				<Segmented
					label="GIF framerate"
					value={options.gifFps}
					options={GIF_FPS_OPTIONS}
					onChange={value => store.setGifFps(value)}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Button
					size="sm"
					className="h-8 gap-1.5 text-xs"
					disabled={!canExport}
					onClick={() => void store.exportMp4()}
				>
					{busy ? (
						<Loader2
							aria-hidden
							className="size-3.5 animate-spin"
						/>
					) : (
						<Film aria-hidden className="size-3.5" />
					)}
					Export MP4
				</Button>
				<Button
					size="sm"
					variant="secondary"
					className="h-8 gap-1.5 text-xs"
					disabled={!canExport}
					onClick={() => void store.exportGif()}
				>
					<ImageIcon aria-hidden className="size-3.5" />
					Export GIF
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

			{busy ? (
				<div
					role="progressbar"
					aria-label="Export progress"
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

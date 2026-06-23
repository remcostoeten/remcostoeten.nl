'use client'

import { useState, memo } from 'react'
import { ExternalLink, Loader2, Play } from 'lucide-react'
import type { TPreview } from '../types'

type Props = {
	preview: TPreview
	name: string
	isVisible?: boolean
}

export const ProjectPreviewRenderer = memo(function ProjectPreviewRenderer({
	preview,
	name,
	isVisible = false
}: Props) {
	const [isLoading, setIsLoading] = useState(true)
	const [isIframeActive, setIsIframeActive] = useState(false)

	if (!preview || preview.type === 'none' || !isVisible) return null

	const iframeSrc =
		preview.type === 'iframe' ? preview.embedUrl || preview.url : undefined

	return (
		<div className="relative h-[180px] sm:h-[240px] w-full overflow-hidden border-t border-border bg-black/50">
			{isLoading && preview.type !== 'iframe' && (
				<div className="absolute inset-0 z-10 flex items-center justify-center">
					<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
				</div>
			)}

			{preview.type === 'video' && (
				<video
					src={preview.src}
					poster={preview.poster}
					autoPlay
					loop
					muted
					playsInline
					preload="none"
					className="h-full w-full object-cover"
					onLoadedData={() => setIsLoading(false)}
				/>
			)}

			{preview.type === 'image' && (
				<img
					src={preview.src || '/placeholder.svg'}
					alt={preview.alt || name}
					loading="lazy"
					decoding="async"
					className="h-full w-full object-cover"
					onLoad={() => setIsLoading(false)}
				/>
			)}

			{preview.type === 'iframe' && !isIframeActive && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/95 px-4 text-center">
					<div className="max-w-xs space-y-1">
						<p className="text-sm font-medium text-foreground">
							Live preview paused
						</p>
						<p className="text-xs leading-relaxed text-muted-foreground">
							Load the embedded app only when you want to inspect
							it.
						</p>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-2">
						<button
							type="button"
							onClick={() => {
								setIsLoading(true)
								setIsIframeActive(true)
							}}
							className="inline-flex items-center gap-2 rounded border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
						>
							<Play className="h-3 w-3" />
							Load live preview
						</button>
						{iframeSrc && (
							<a
								href={iframeSrc}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded border border-border/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								<ExternalLink className="h-3 w-3" />
								Open app
							</a>
						)}
					</div>
				</div>
			)}

			{preview.type === 'iframe' && isIframeActive && iframeSrc && (
				<>
					{isLoading && (
						<div className="absolute inset-0 z-10 flex items-center justify-center">
							<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
						</div>
					)}
					<iframe
						src={iframeSrc}
						title={name}
						loading="lazy"
						sandbox="allow-scripts allow-same-origin"
						className="h-[360px] sm:h-[480px] w-[200%] origin-top-left"
						style={{ transform: `scale(${preview.scale || 0.5})` }}
						onLoad={() => setIsLoading(false)}
					/>
				</>
			)}
		</div>
	)
})

'use client'

import { useState, memo } from 'react'
import { Loader2 } from 'lucide-react'
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

	if (!preview || preview.type === 'none' || !isVisible) return null

	return (
		<div className="relative h-[180px] sm:h-[240px] w-full overflow-hidden border-t border-border bg-black/50">
			{preview.type === 'iframe' && !isLoading && (
				<div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/70 backdrop-blur-sm border border-border text-[10px] text-muted-foreground">
					<span className="relative flex h-1.5 w-1.5">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
						<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
					</span>
					live
				</div>
			)}

			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center">
					<div className="absolute inset-0 animate-pulse bg-muted/20" />
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

			{preview.type === 'iframe' && (
				<iframe
					src={preview.embedUrl || preview.url}
					title={name}
					loading={isVisible ? 'eager' : 'lazy'}
					sandbox="allow-scripts allow-same-origin"
					className="h-[360px] sm:h-[480px] w-[200%] origin-top-left"
					style={{ transform: `scale(${preview.scale || 0.5})` }}
					onLoad={() => setIsLoading(false)}
				/>
			)}
		</div>
	)
})

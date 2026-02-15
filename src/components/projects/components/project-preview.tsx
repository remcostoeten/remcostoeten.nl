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
			{preview.type === 'iframe' && !isLoading && null}

			{isLoading && (
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

			{preview.type === 'iframe' && (
				<iframe
					src={preview.embedUrl || preview.url}
					title={name}
					loading="lazy"
					sandbox="allow-scripts allow-same-origin"
					className="h-[360px] sm:h-[480px] w-[200%] origin-top-left"
					style={{ transform: `scale(${preview.scale || 0.5})` }}
					onLoad={() => setIsLoading(false)}
				/>
			)}
		</div>
	)
})

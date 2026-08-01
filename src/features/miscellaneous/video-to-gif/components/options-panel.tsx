'use client'

import { Segmented } from '../../link-extractor/components/segmented'
import { FPS_OPTIONS, QUALITY_OPTIONS, WIDTH_OPTIONS } from '../constants'
import type { TVideoToGifStore } from '../hooks/use-video-to-gif-store'

type Props = {
	store: TVideoToGifStore
}

export function OptionsPanel({ store }: Props) {
	const { options } = store

	return (
		<section
			aria-label="GIF settings"
			className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-border/50 bg-card p-3"
		>
			<div className="flex items-center gap-2">
				<span className="text-xs text-muted-foreground">Framerate</span>
				<Segmented
					label="Framerate"
					value={options.fps}
					options={FPS_OPTIONS}
					onChange={value => store.setFps(value)}
				/>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-xs text-muted-foreground">Width</span>
				<Segmented
					label="Width"
					value={options.width}
					options={WIDTH_OPTIONS}
					onChange={value => store.setWidth(value)}
				/>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-xs text-muted-foreground">Quality</span>
				<Segmented
					label="Quality"
					value={options.quality}
					options={QUALITY_OPTIONS}
					onChange={value => store.setQuality(value)}
				/>
			</div>
		</section>
	)
}

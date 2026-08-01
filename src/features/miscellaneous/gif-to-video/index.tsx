'use client'

import { MediaDropzone } from '../components/media-dropzone'
import { ConvertPanel } from './components/convert-panel'
import { ACCEPTED_INPUT, MAX_INPUT_MB } from './constants'
import { useGifToVideoStore } from './hooks/use-gif-to-video-store'

export default function GifToVideo() {
	const store = useGifToVideoStore()

	return (
		<div className="flex flex-col gap-3">
			<MediaDropzone
				file={store.file}
				disabled={store.busy}
				accept={ACCEPTED_INPUT}
				emptyTitle="Drop a GIF or click to select"
				emptyHint={`Animated GIF up to ${MAX_INPUT_MB} MB — nothing leaves your browser`}
				inputLabel="Select a GIF"
				onSelect={store.selectFile}
			/>
			{store.fileUrl && !store.output ? (
				<figure className="flex flex-col gap-1">
					<img
						src={store.fileUrl}
						alt="Source GIF"
						className="max-h-72 w-fit max-w-full border border-border/50"
					/>
					<figcaption className="text-xs text-muted-foreground">
						Source GIF
					</figcaption>
				</figure>
			) : null}
			<ConvertPanel store={store} />
		</div>
	)
}

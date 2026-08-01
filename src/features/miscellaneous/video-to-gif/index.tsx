'use client'

import { MediaDropzone } from '../components/media-dropzone'
import { MediaTrimPanel } from '../components/media-trim-panel'
import { ConvertPanel } from './components/convert-panel'
import { OptionsPanel } from './components/options-panel'
import { ACCEPTED_INPUT, MAX_INPUT_MB } from './constants'
import { useVideoToGifStore } from './hooks/use-video-to-gif-store'

export default function VideoToGif() {
	const store = useVideoToGifStore()

	return (
		<div className="flex flex-col gap-3">
			<MediaDropzone
				file={store.file}
				disabled={store.busy}
				accept={ACCEPTED_INPUT}
				emptyTitle="Drop a video or click to select"
				emptyHint={`MP4, MOV, MKV, WEBM or AVI up to ${MAX_INPUT_MB} MB — nothing leaves your browser`}
				inputLabel="Select a video"
				onSelect={store.selectFile}
			/>
			{store.fileUrl ? (
				<MediaTrimPanel
					fileUrl={store.fileUrl}
					trim={store.trim}
					duration={store.duration}
					canUndo={store.canUndoTrim}
					onMetadata={store.handleMetadata}
					onChange={store.updateTrim}
					onCommit={store.commitTrim}
					onUndo={store.undoTrim}
					onReset={store.resetTrim}
				/>
			) : null}
			<OptionsPanel store={store} />
			<ConvertPanel store={store} />
		</div>
	)
}

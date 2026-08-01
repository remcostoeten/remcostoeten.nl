'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaDropzone } from '../components/media-dropzone'
import { MediaTrimPanel } from '../components/media-trim-panel'
import { ExportPanel } from './components/export-panel'
import { ACCEPTED_INPUT, MAX_INPUT_MB } from './constants'
import { useSendableVideoStore } from './hooks/use-sendable-video-store'

export default function SendableVideo() {
	const store = useSendableVideoStore()

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-2">
				<MediaDropzone
					file={store.file}
					disabled={store.busy}
					accept={ACCEPTED_INPUT}
					emptyTitle="Drop a video or click to select"
					emptyHint={`MP4, MOV, MKV, WEBM or AVI up to ${MAX_INPUT_MB} MB - nothing leaves your browser`}
					inputLabel="Select a video"
					onSelect={store.selectFile}
				/>
				{store.file ? (
					<Button
						type="button"
						size="sm"
						variant="ghost"
						className="self-start h-8 gap-1.5 text-xs"
						disabled={store.busy}
						onClick={() => store.selectFile(null)}
					>
						<X aria-hidden className="size-3.5" />
						Clear video
					</Button>
				) : null}
			</div>
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
			<ExportPanel store={store} />
		</div>
	)
}

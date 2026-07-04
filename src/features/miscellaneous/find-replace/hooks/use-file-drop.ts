'use client'

import { useCallback, useState } from 'react'
import type { DragEvent } from 'react'
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE } from '../constants'

type TFileReadResult =
	| { ok: true; name: string; content: string }
	| { ok: false; error: string }

export async function readTextFile(file: File): Promise<TFileReadResult> {
	if (file.size > MAX_FILE_SIZE) {
		return {
			ok: false,
			error: `File is too large (max ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB).`
		}
	}
	const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
	const looksTextual =
		file.type.startsWith('text/') ||
		file.type === 'application/json' ||
		ACCEPTED_FILE_EXTENSIONS.includes(extension)
	if (!looksTextual) {
		return { ok: false, error: `"${file.name}" is not a text file.` }
	}
	try {
		const content = await file.text()
		return { ok: true, name: file.name, content }
	} catch {
		return { ok: false, error: `Could not read "${file.name}".` }
	}
}

export function useFileDrop(onFile: (result: TFileReadResult) => void) {
	const [dragging, setDragging] = useState(false)

	const onDragOver = useCallback((event: DragEvent) => {
		if (!event.dataTransfer.types.includes('Files')) return
		event.preventDefault()
		setDragging(true)
	}, [])

	const onDragLeave = useCallback((event: DragEvent) => {
		if (event.currentTarget.contains(event.relatedTarget as Node)) return
		setDragging(false)
	}, [])

	const onDrop = useCallback(
		(event: DragEvent) => {
			if (!event.dataTransfer.types.includes('Files')) return
			event.preventDefault()
			setDragging(false)
			const file = event.dataTransfer.files[0]
			if (!file) return
			void readTextFile(file).then(onFile)
		},
		[onFile]
	)

	return { dragging, dropProps: { onDragOver, onDragLeave, onDrop } }
}

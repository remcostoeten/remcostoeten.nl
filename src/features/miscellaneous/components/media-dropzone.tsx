'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { bytesToHuman } from '../utils/format'

type Props = {
	file: File | null
	disabled: boolean
	accept: string
	emptyTitle: string
	emptyHint: string
	inputLabel: string
	onSelect: (file: File | null) => void
}

export function MediaDropzone({
	file,
	disabled,
	accept,
	emptyTitle,
	emptyHint,
	inputLabel,
	onSelect
}: Props) {
	const [dragging, setDragging] = useState(false)

	return (
		<label
			onDragOver={event => {
				event.preventDefault()
				if (!disabled) setDragging(true)
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={event => {
				event.preventDefault()
				setDragging(false)
				if (disabled) return
				onSelect(event.dataTransfer.files?.[0] ?? null)
			}}
			className={cn(
				'flex cursor-pointer flex-col items-center gap-1 border border-dashed border-border/50 bg-card px-4 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-muted/40',
				dragging && 'border-ring bg-muted/60',
				file && 'border-solid py-5',
				disabled && 'cursor-not-allowed opacity-60'
			)}
		>
			<input
				type="file"
				accept={accept}
				disabled={disabled}
				aria-label={inputLabel}
				className="sr-only"
				onChange={event => {
					onSelect(event.target.files?.[0] ?? null)
					event.target.value = ''
				}}
			/>
			<Upload aria-hidden className="size-5 text-muted-foreground" />
			{file ? (
				<>
					<span className="max-w-full truncate text-sm text-foreground">
						{file.name}
					</span>
					<span className="text-xs text-muted-foreground">
						{bytesToHuman(file.size)} - drop or click to replace
					</span>
				</>
			) : (
				<>
					<span className="text-sm text-foreground">
						{emptyTitle}
					</span>
					<span className="text-xs text-muted-foreground">
						{emptyHint}
					</span>
				</>
			)}
		</label>
	)
}

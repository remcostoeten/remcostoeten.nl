import { useRef, useState } from 'react'
import { ClipboardPaste, FileUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { extractSvgs } from '../utilities/extract-svgs'

type Props = {
	value: string
	message: string
	count: number
	onChange: (value: string) => void
	onImmediate: (value: string, filenames?: (string | undefined)[]) => void
	onClear: () => void
	onPaste: () => Promise<void>
}

export function SvgInput({
	value,
	message,
	count,
	onChange,
	onImmediate,
	onClear,
	onPaste
}: Props) {
	const [dragging, setDragging] = useState(false)
	const fileRef = useRef<HTMLInputElement>(null)

	async function processFiles(files: FileList | File[]) {
		const svgFiles = Array.from(files).filter(file =>
			file.name.toLowerCase().endsWith('.svg')
		)
		if (!svgFiles.length) return
		const texts = await Promise.all(svgFiles.map(file => file.text()))
		const names = svgFiles.flatMap((file, index) =>
			extractSvgs(texts[index]).sources.map(() => file.name)
		)
		onImmediate(texts.join('\n'), names)
	}

	return (
		<section
			className="border-b border-border/60 pb-3"
			aria-labelledby="svg-input-title"
		>
			<div className="mb-2 flex items-center justify-between gap-2">
				<div>
					<h2
						id="svg-input-title"
						className="text-xs font-semibold uppercase tracking-wider"
					>
						Source
					</h2>
					<p className="text-[11px] text-muted-foreground">
						{count} SVG{count === 1 ? '' : 's'} detected · processed
						locally
					</p>
				</div>
				<div className="flex gap-1">
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={onPaste}
					>
						<ClipboardPaste
							aria-hidden
							className="mr-1.5 size-3.5"
						/>
						Paste
					</Button>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={() => fileRef.current?.click()}
					>
						<FileUp aria-hidden className="mr-1.5 size-3.5" />
						Files
					</Button>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-9"
						aria-label="Clear SVG input"
						disabled={!value}
						onClick={onClear}
					>
						<Trash2 aria-hidden className="size-3.5" />
					</Button>
				</div>
			</div>
			<input
				ref={fileRef}
				className="sr-only"
				type="file"
				accept=".svg,image/svg+xml"
				multiple
				onChange={event => {
					if (event.target.files)
						void processFiles(event.target.files)
					event.target.value = ''
				}}
			/>
			<div
				className={dragging ? 'border-foreground/60' : 'border-border'}
				onDragEnter={event => {
					event.preventDefault()
					setDragging(true)
				}}
				onDragOver={event => event.preventDefault()}
				onDragLeave={() => setDragging(false)}
				onDrop={event => {
					event.preventDefault()
					setDragging(false)
					void processFiles(event.dataTransfer.files)
				}}
			>
				<label htmlFor="svg-source" className="sr-only">
					SVG markup
				</label>
				<textarea
					id="svg-source"
					value={value}
					onChange={event => onChange(event.target.value)}
					spellCheck={false}
					placeholder={'Paste <svg> markup or drop .svg files here…'}
					className="min-h-32 max-h-64 w-full resize-y border bg-background p-3 font-mono text-xs leading-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>
			{message ? (
				<p role="status" className="mt-2 text-xs text-muted-foreground">
					{message}
				</p>
			) : null}
		</section>
	)
}

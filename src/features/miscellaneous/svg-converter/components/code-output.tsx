'use client'

import nextDynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import {
	Check,
	Clipboard,
	Download,
	RotateCcw,
	WandSparkles
} from 'lucide-react'
import type { SvgItem } from '../types/svg-converter'
import { generateCombined } from '../utilities/convert-collection'

const HighlightedCode = nextDynamic(
	() => import('./lazy-code').then(module => module.LazyCode),
	{ loading: () => <CodeFallback /> }
)

function CodeFallback({ code = '' }: { code?: string }) {
	return (
		<pre className="min-h-full bg-[#111] p-4 font-mono text-[11px] leading-5 text-neutral-200">
			{code}
		</pre>
	)
}

type Props = {
	item?: SvgItem
	items: SvgItem[]
	individual: string
	registry: boolean
	onCopy: (text: string) => Promise<boolean>
	onDownload: (content: string, filename: string) => void
	onFormat: () => void
	onReset: () => void
}

export function CodeOutput({
	item,
	items,
	individual,
	registry,
	onCopy,
	onDownload,
	onFormat,
	onReset
}: Props) {
	const [tab, setTab] = useState<'individual' | 'combined' | 'package'>(
		'individual'
	)
	const [copied, setCopied] = useState(false)
	const combined = useMemo(
		() => (tab === 'combined' ? generateCombined(items, registry) : ''),
		[tab, items, registry]
	)
	const packageFiles = useMemo(
		() =>
			items
				.filter(entry => entry.state !== 'invalid')
				.map(entry => `icons/${entry.filename}`)
				.concat('icons/types.ts', 'icons/index.ts')
				.sort(),
		[items]
	)
	const code = tab === 'individual' ? individual : combined
	const filename =
		tab === 'individual' ? (item?.filename ?? 'component.tsx') : 'icons.tsx'
	async function copy() {
		if (await onCopy(code)) {
			setCopied(true)
			setTimeout(() => setCopied(false), 1400)
		}
	}
	return (
		<section
			aria-labelledby="output-title"
			className="flex min-h-[680px] flex-col lg:max-h-[calc(100vh-8rem)]"
		>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
				<div>
					<h2
						id="output-title"
						className="text-xs font-semibold uppercase tracking-wider"
					>
						Output
					</h2>
					<p className="font-mono text-[10px] text-muted-foreground">
						{filename} · {item?.component ?? 'No selection'}
					</p>
				</div>
				<div className="flex gap-1">
					<button
						type="button"
						disabled={!item}
						onClick={onFormat}
						className="border p-2 disabled:opacity-40"
						aria-label="Format generated TSX"
					>
						<WandSparkles aria-hidden className="size-3.5" />
					</button>
					<button
						type="button"
						disabled={!item}
						onClick={onReset}
						className="border p-2 disabled:opacity-40"
						aria-label="Reset conversion settings"
					>
						<RotateCcw aria-hidden className="size-3.5" />
					</button>
					<button
						type="button"
						disabled={!code}
						onClick={copy}
						className="border p-2 disabled:opacity-40"
						aria-label="Copy generated TSX"
					>
						{copied ? (
							<Check aria-hidden className="size-3.5" />
						) : (
							<Clipboard aria-hidden className="size-3.5" />
						)}
					</button>
					<button
						type="button"
						disabled={!code}
						onClick={() => onDownload(code, filename)}
						className="border p-2 disabled:opacity-40"
						aria-label="Download generated TSX"
					>
						<Download aria-hidden className="size-3.5" />
					</button>
				</div>
			</div>
			<div role="tablist" className="flex border-b text-[11px]">
				{(['individual', 'combined', 'package'] as const).map(value => (
					<button
						key={value}
						role="tab"
						aria-selected={tab === value}
						type="button"
						onClick={() => setTab(value)}
						className={`px-3 py-2 capitalize ${tab === value ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}
					>
						{value}
					</button>
				))}
			</div>
			<div className="min-h-0 grow overflow-auto border-x border-b">
				{tab === 'package' ? (
					<pre className="min-h-full bg-[#111] p-4 font-mono text-xs leading-6 text-neutral-200">
						generated-icons.zip
						{packageFiles.map(file => `\n└─ ${file}`)}
					</pre>
				) : code ? (
					<HighlightedCode code={code} />
				) : (
					<CodeFallback code="Select a valid SVG to inspect its generated component." />
				)}
			</div>
		</section>
	)
}

'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { HighlightedLine } from '@/components/packages/package-code'
import { PeekFrame } from './peek-frame'

type Props = {
	label: string
	install: string
	code: string
}

export function PackageSnippet({ label, install, code }: Props) {
	const [copied, setCopied] = useState(false)

	function copyInstall() {
		navigator.clipboard
			.writeText(install)
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 1500)
			})
			.catch(() => setCopied(false))
	}

	return (
		<PeekFrame label={label}>
			<div className="absolute inset-0 flex flex-col bg-[hsl(var(--sh-background))]">
				<div className="flex items-center gap-2 border-b border-[hsl(var(--sh-border))] px-2.5 py-1.5">
					<button
						type="button"
						onClick={copyInstall}
						className="inline-flex size-5 shrink-0 items-center justify-center text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
						aria-label={copied ? 'Copied' : 'Copy install command'}
					>
						{copied ? (
							<Check className="size-3" aria-hidden="true" />
						) : (
							<Copy className="size-3" aria-hidden="true" />
						)}
					</button>
					<code className="min-w-0 flex-1 truncate font-mono text-[10px] text-[hsl(var(--sh-text))]">
						<span className="select-none text-muted-foreground/50">
							${' '}
						</span>
						{install}
					</code>
				</div>
				<div className="relative min-h-0 flex-1 overflow-hidden">
					<pre className="overflow-hidden p-2.5 font-mono text-[10px] leading-[1.6] text-[hsl(var(--sh-text))]">
						<code>
							{code.split('\n').map((line, index) => (
								<span
									key={`${index}-${line}`}
									className="block min-h-[1.6em] whitespace-pre"
								>
									<HighlightedLine line={line} />
								</span>
							))}
						</code>
					</pre>
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[hsl(var(--sh-background))] to-transparent" />
				</div>
			</div>
		</PeekFrame>
	)
}

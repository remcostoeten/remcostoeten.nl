'use client'

import { useEffect, useRef, useState } from 'react'
import { playIcon } from '@/components/animated-icons/icon-frame'
import { AnimatedCheckIcon } from '@/components/animated-icons/icons/check'
import { AnimatedCopyIcon } from '@/components/animated-icons/icons/copy'
import { HighlightedCommand } from '@/components/packages/package-code'
import { cn } from '@/shared/lib/cn'

type Props = {
	command: string
}

const iconSwap =
	'absolute inset-0 size-3 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity'
const shown = 'scale-100 opacity-100 blur-none'
const hidden =
	'scale-50 opacity-0 blur-[2px] motion-reduce:scale-100 motion-reduce:blur-none'

export function InstallCommand({ command }: Props) {
	const [copied, setCopied] = useState(false)
	const check = useRef<SVGSVGElement>(null)
	const reset = useRef<number>(undefined)

	useEffect(() => () => window.clearTimeout(reset.current), [])

	function copy() {
		navigator.clipboard
			.writeText(command)
			.then(() => {
				setCopied(true)
				if (check.current) playIcon(check.current)
				window.clearTimeout(reset.current)
				reset.current = window.setTimeout(() => setCopied(false), 1600)
			})
			.catch(() => setCopied(false))
	}

	return (
		<button
			type="button"
			onClick={copy}
			title={command}
			aria-label="Copy install command"
			data-icon-trigger
			className="group/install -mx-1.5 flex min-w-0 items-center gap-2 rounded-sm px-1.5 py-1 text-left transition-colors duration-150 ease-out hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline-none"
		>
			<code className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground">
				<HighlightedCommand command={command} />
			</code>
			<span className="relative size-3 shrink-0 text-muted-foreground transition-[color,scale] duration-150 ease-out group-hover/install:text-foreground group-active/install:scale-90">
				<AnimatedCopyIcon
					className={cn(iconSwap, copied ? hidden : shown)}
				/>
				<AnimatedCheckIcon
					ref={check}
					className={cn(iconSwap, copied ? shown : hidden)}
				/>
			</span>
			<span className="sr-only" aria-live="polite">
				{copied ? 'Copied' : ''}
			</span>
		</button>
	)
}

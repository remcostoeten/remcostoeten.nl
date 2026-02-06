'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CopyButton({
	code,
	className
}: {
	code: string
	className?: string
}) {
	const [copied, setCopied] = useState(false)

	const copy = async () => {
		await navigator.clipboard.writeText(code)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<button
			onClick={copy}
			className={cn(
				'inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors',
				className
			)}
		>
			{copied ? (
				<>
					<Check className="w-3.5 h-3.5" />
					Copied
				</>
			) : (
				<>
					<Copy className="w-3.5 h-3.5" />
					Copy code
				</>
			)}
		</button>
	)
}

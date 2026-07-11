import type { Metadata } from 'next'
import { Wrench } from 'lucide-react'
import { createPageMetadata } from '@/core/metadata/base'
import { ToolsHub } from '@/features/miscellaneous/components/tools-hub'

export const metadata: Metadata = createPageMetadata({
	title: 'Miscellaneous Tools',
	description:
		'A collection of small, browser-based developer utilities. Find & replace, formatters, converters and generators — everything runs client-side.',
	canonical: '/tools',
	keywords: [
		'developer tools',
		'find and replace',
		'text utilities',
		'browser tools'
	]
})

function ToolsIntro() {
	return (
		<div>
			<h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
				<Wrench aria-hidden className="size-4 text-muted-foreground" />
				Miscellaneous Tools
			</h1>
			<p className="mt-1 text-sm text-muted-foreground max-w-prose">
				A growing collection of small, browser-based utilities. Everything
				runs entirely client-side — nothing you type or upload ever leaves
				your machine.
			</p>
		</div>
	)
}

export default function Page() {
	return <ToolsHub intro={<ToolsIntro />} />
}

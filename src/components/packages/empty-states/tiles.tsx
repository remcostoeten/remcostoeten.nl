import Link from 'next/link'
import type { Route } from 'next'
import { demoEntries } from './entries'

const previewIds = ['search', 'inbox', 'uploads', 'offline']

const previewEntries = previewIds.flatMap(id => {
	const entry = demoEntries.find(item => item.id === id)
	return entry ? [entry] : []
})

type Props = {
	href: string
}

export function EmptyStateTiles({ href }: Props) {
	return (
		<ul className="grid grid-cols-2 border-t border-l border-border/70 bg-background">
			{previewEntries.map(entry => (
				<li
					key={entry.id}
					className="border-r border-b border-border/70"
				>
					<Link
						href={
							`${href}?component=${entry.id}#component` as Route
						}
						data-loop="float"
						className="group flex h-full flex-col items-center gap-2 px-2 pt-3 pb-2.5 text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:bg-muted/40 focus-visible:text-foreground [&>div:first-child]:h-16 [&>div:first-child]:w-28"
					>
						{entry.illustration(entry.defaults.variant)}
						<span className="text-xs text-foreground/80">
							{entry.defaults.title}
						</span>
					</Link>
				</li>
			))}
		</ul>
	)
}

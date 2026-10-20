import Link from 'next/link'
import type { Route } from 'next'
import { demoEntries } from './entries'

const previewIds = ['organizations', 'projects', 'records', 'calendar']

const previewEntries = previewIds.flatMap(id => {
	const entry = demoEntries.find(item => item.id === id)
	return entry ? [entry] : []
})

type Props = {
	href: string
}

export function EmptyStateTiles({ href }: Props) {
	return (
		<ul className="grid grid-cols-2 border-t border-l border-border/70 bg-background [--es-background:var(--color-background)] [--es-border:var(--color-border)] [--es-foreground:var(--color-foreground)] [--es-muted:var(--color-muted-foreground)] [--es-surface:var(--color-background)]">
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
						className="group flex h-full flex-col items-center gap-1.5 px-2 pt-2.5 pb-2 text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:bg-muted/40 focus-visible:text-foreground"
					>
						<span className="flex h-14 items-center justify-center [&>div]:[zoom:0.45]">
							{entry.illustration(entry.defaults.variant)}
						</span>
						<span className="text-center text-xs text-balance text-foreground/80">
							{entry.defaults.title}
						</span>
					</Link>
				</li>
			))}
		</ul>
	)
}

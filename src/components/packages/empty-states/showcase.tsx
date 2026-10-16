'use client'

import { ResourceShowcase } from '@/components/resources/showcase'
import type { ResourceConfig } from '@/components/resources/types'
import { demoEntries } from './entries'
import { Playground } from './playground'

const config: ResourceConfig = {
	title: 'Empty states',
	description:
		'Copyable React empty states. Preview, customize, and take the source.',
	stack: 'TSX + Tailwind v4',
	navLabel: 'Empty states',
	itemNoun: 'empty state',
	countLabel: 'states',
	version: '0.1.0',
	registryItem: 'empty-state',
	installDir: 'components/empty-state',
	files: ['empty-state.tsx', 'illustrations.tsx'],
	defaultId: 'records'
}

const record = 'absolute h-4 rounded-[3px] border border-border bg-background'

function SidebarFooter() {
	return (
		<>
			<div className="relative h-[30px] w-[42px]" aria-hidden="true">
				<span className={`inset-x-1.5 top-0 ${record}`} />
				<span className={`inset-x-[3px] top-1.5 ${record}`} />
				<span className={`inset-x-0 top-3 ${record}`} />
			</div>
			<p className="mt-[17px] mb-[23px] text-[11px] leading-[1.8] text-muted-foreground">
				A place to start,
				<br />
				before there&apos;s anything.
			</p>
		</>
	)
}

export function EmptyStatesShowcase() {
	return (
		<ResourceShowcase
			config={config}
			entries={demoEntries}
			sidebarFooter={<SidebarFooter />}
		>
			{(entry, notify) => (
				<Playground
					key={entry.id}
					config={config}
					entry={entry}
					notify={notify}
				/>
			)}
		</ResourceShowcase>
	)
}

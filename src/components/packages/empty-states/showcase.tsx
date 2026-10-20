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
	defaultId: 'organizations'
}

export function EmptyStatesShowcase() {
	return (
		<ResourceShowcase config={config} entries={demoEntries}>
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

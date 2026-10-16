'use client'

import { ResourceShowcase } from '@/components/resources/showcase'
import type { ResourceConfig } from '@/components/resources/types'
import { iconEntries } from './entries'
import { Playground } from './playground'

const config: ResourceConfig = {
	title: 'Animated icons',
	description:
		'Stroke icons whose parts move on hover, focus or state changes. Preview, tune, and take the source.',
	stack: 'TSX + CSS',
	navLabel: 'Icons',
	itemNoun: 'icon',
	countLabel: 'icons',
	version: '0.1.0',
	registryItem: 'animated-icons',
	installDir: 'components/animated-icons',
	files: ['icon-frame.tsx', 'animated-icons.css'],
	defaultId: 'search'
}

export function AnimatedIconsShowcase() {
	return (
		<ResourceShowcase
			config={config}
			entries={iconEntries}
			gridNav
			renderIcon={entry => <entry.Icon size={20} />}
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

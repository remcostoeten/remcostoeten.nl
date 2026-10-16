import type { Metadata } from 'next'
import { PackagesSection } from '@/components/packages/packages-section'
import { baseUrl, createPageMetadata } from '@/core/metadata/base'

export const metadata: Metadata = createPageMetadata({
	title: 'Open-source React packages',
	description:
		'Open-source React and TypeScript packages by Remco Stoeten: Spoar analytics, Auth Drawer, use-shortcut, Notifier, empty states and animated icons.',
	keywords: [
		'React packages',
		'TypeScript libraries',
		'npm packages',
		'open source',
		'shadcn registry',
		'Remco Stoeten'
	],
	image: `${baseUrl}/og?title=${encodeURIComponent('Open-source React packages')}`,
	canonical: '/packages'
})

export default function PackagesPage() {
	return (
		<div className="space-y-4">
			<header className="px-4 md:px-5">
				<p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
					Open source
				</p>
				<h1 className="mt-2 text-xl font-semibold tracking-tight">
					Developer packages
				</h1>
				<p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
					Small, focused React and TypeScript tools built from
					recurring product problems.
				</p>
			</header>
			<PackagesSection />
		</div>
	)
}

import type { Metadata } from 'next'
import { PackagesSection } from '@/components/packages/packages-section'
import { createPageMetadata } from '@/core/metadata/base'

export const metadata: Metadata = createPageMetadata({
	title: 'Open-source React packages',
	description:
		'React and TypeScript packages by Remco Stoeten, including Auth Drawer, use-shortcut, and Notifier.',
	keywords: [
		'React packages',
		'TypeScript libraries',
		'npm packages',
		'open source',
		'Remco Stoeten'
	],
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

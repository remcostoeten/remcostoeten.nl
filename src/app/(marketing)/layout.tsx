import { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Footer } from '@/components/layout/footer'
import { MarketingMain } from '@/components/layout/marketing-main'

export default function MarketingLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen w-full flex flex-col overflow-x-clip">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus-visible:outline-none focus-visible:bg-muted"
			>
				Skip to content
			</a>
			<MarketingMain>
				<div className="px-4 md:px-5 pb-4">
					<Breadcrumbs />
				</div>
				{children}
			</MarketingMain>
			<Footer />
		</div>
	)
}

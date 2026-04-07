import { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Footer } from '@/components/layout/footer'
import { AnnouncementBanner } from '@/components/ui/announcement-banner'

export default function MarketingLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen w-full flex flex-col">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			>
				Skip to content
			</a>
			<AnnouncementBanner />
			<main
				id="main-content"
				tabIndex={-1}
				className="py-6 max-w-2xl mx-auto w-full grow border-x border-border/50"
			>
				<div className="px-4 md:px-5 pb-4">
					<Breadcrumbs />
				</div>
				{children}
			</main>
			<Footer />
		</div>
	)
}

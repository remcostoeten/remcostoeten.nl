import { ReactNode } from 'react'

export default function BlogLayout({ children }: { children: ReactNode }) {
	return (
		<main className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
			{children}
		</main>
	)
}

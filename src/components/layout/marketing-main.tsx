'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/cn'

const wideRoutes = new Set([
	'/packages/empty-states',
	'/packages/animated-icons'
])

export function MarketingMain({ children }: { children: ReactNode }) {
	const wide = wideRoutes.has(usePathname())

	return (
		<main
			id="main-content"
			tabIndex={-1}
			className={cn(
				'py-6 mx-auto w-full grow border-x border-border/50 outline-none',
				wide ? 'max-w-[1400px]' : 'max-w-2xl'
			)}
		>
			{children}
		</main>
	)
}

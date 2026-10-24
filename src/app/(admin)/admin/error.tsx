'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

type Props = {
	error: Error & { digest?: string }
	reset: () => void
}

export default function AdminError({ error, reset }: Props) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Something went wrong"
				description="This page failed to load. Retry, or head back to the overview."
			/>

			<section className="admin-panel">
				<div className="admin-panel-header items-center">
					<h2 className="admin-panel-title">Error details</h2>
					{error.digest && (
						<span className="admin-pill" data-tone="plain">
							{error.digest}
						</span>
					)}
				</div>
				<p className="break-words px-5 pb-5 text-[13px] text-muted-foreground">
					{error.message}
				</p>
				<div className="flex items-center gap-2 border-t border-border px-5 py-4">
					<button
						type="button"
						onClick={() => reset()}
						className="admin-btn"
						data-variant="primary"
					>
						<RotateCcw className="size-4" />
						Try again
					</button>
					<Link href="/admin" className="admin-btn">
						Back to overview
					</Link>
				</div>
			</section>
		</div>
	)
}

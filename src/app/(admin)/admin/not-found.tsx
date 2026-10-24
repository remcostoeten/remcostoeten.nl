import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

export default function AdminNotFound() {
	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Page not found"
				description="Nothing lives at this address in the admin."
			/>

			<section className="admin-panel">
				<div className="admin-panel-header items-center">
					<h2 className="admin-panel-title">Not found</h2>
					<span className="admin-pill" data-tone="plain">
						404
					</span>
				</div>
				<p className="px-5 pb-5 admin-text-sm text-muted-foreground">
					The post, message or page you opened does not exist or was
					removed.
				</p>
				<div className="flex items-center gap-2 border-t border-border px-5 py-4">
					<Link
						href="/admin"
						className="admin-btn"
						data-variant="primary"
					>
						<ArrowLeft className="size-4" />
						Back to overview
					</Link>
					<Link href="/admin/messages" className="admin-btn">
						Open inbox
					</Link>
				</div>
			</section>
		</div>
	)
}

import { checkAdminStatus } from '@/server/queries/auth'
import { getRecentMessageCount } from '@/server/queries/admin'
import { redirect } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { AdminSidebar, AdminTopbar } from '@/components/admin/admin-sidebar'
import './admin.css'

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<Suspense
			fallback={
				<div className="admin-shell flex items-center justify-center text-sm text-muted-foreground">
					Loading admin…
				</div>
			}
		>
			<AdminShell>{children}</AdminShell>
		</Suspense>
	)
}

async function AdminShell({ children }: { children: ReactNode }) {
	const isAdmin = await checkAdminStatus()

	if (!isAdmin) {
		redirect('/')
	}

	const unreadMessages = await getRecentMessageCount()

	return (
		<div className="admin-shell flex">
			<AdminSidebar unreadMessages={unreadMessages} />

			<div className="flex min-w-0 flex-1 flex-col">
				<AdminTopbar unreadMessages={unreadMessages} />

				<main className="w-full max-w-[1400px] flex-1 px-4 py-8 md:px-9 md:py-10">
					{children}
				</main>
			</div>
		</div>
	)
}

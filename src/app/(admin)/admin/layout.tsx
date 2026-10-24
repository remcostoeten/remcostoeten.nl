import { checkAdminStatus } from '@/server/queries/auth'
import { getRecentMessageCount } from '@/server/queries/admin'
import { redirect } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { AdminSidebar, AdminTopbar } from '@/components/admin/admin-sidebar'
import './admin.css'

type Props = {
	children: ReactNode
}

export default function AdminLayout({ children }: Props) {
	return (
		<Suspense fallback={<Shell unreadMessages={0}>{null}</Shell>}>
			<AdminShell>{children}</AdminShell>
		</Suspense>
	)
}

function Shell({
	unreadMessages,
	children
}: Props & { unreadMessages: number }) {
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

async function AdminShell({ children }: Props) {
	const isAdmin = await checkAdminStatus()

	if (!isAdmin) {
		redirect('/')
	}

	const unreadMessages = await getRecentMessageCount()

	return <Shell unreadMessages={unreadMessages}>{children}</Shell>
}

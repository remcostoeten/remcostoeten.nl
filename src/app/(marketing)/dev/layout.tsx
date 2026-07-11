import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { canAccessDevTools } from '@/server/security/dev-access'


export default async function DevLayout({ children }: { children: ReactNode }) {
	const canAccess = await canAccessDevTools()

	if (!canAccess) {
		notFound()
	}

	return children
}

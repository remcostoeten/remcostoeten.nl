'use client'

import { DevWidget } from '../../../tools/dev-menu'
import { useSession, signOut } from '@/lib/auth-client'

export function DevWidgetWrapper() {
	const { data: session } = useSession()

	return (
		<DevWidget
			session={session}
			onSignOut={signOut}
			showAuth={true}
			showRoutes={true}
			showSystemInfo={true}
			showSettings={true}
		/>
	)
}

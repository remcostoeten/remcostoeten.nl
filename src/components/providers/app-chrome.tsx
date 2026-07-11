'use client'

import { Toaster } from 'sonner'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'
import { UnifiedAnalytics } from '@/core/analytics'

export function AppChrome() {
	return (
		<>
			<ThemeSwitch />
			<Toaster />
			<UnifiedAnalytics />
			<VimAuthProvider />
		</>
	)
}

'use client'

import { Debugtools } from '@spoar/debugtools/next'
import { Toaster } from 'sonner'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'
import { UnifiedAnalytics } from '@/core/analytics'

export function AppChrome() {
	return (
		<>
			<UnifiedAnalytics />
			<Debugtools
				endpoint="https://api.analytics.remcostoeten.nl"
				project="remcostoeten.nl"
			/>
			<ThemeSwitch />
			<Toaster />
			<VimAuthProvider />
		</>
	)
}

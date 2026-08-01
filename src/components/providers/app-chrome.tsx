'use client'

import { Toaster } from 'sonner'
import { VimAuthProvider } from '@/components/auth/vim-auth-provider'
import { ThemeSwitch } from '@/components/theme-switch'

export function AppChrome() {
	return (
		<>
			<ThemeSwitch />
			<Toaster />
			<VimAuthProvider />
		</>
	)
}

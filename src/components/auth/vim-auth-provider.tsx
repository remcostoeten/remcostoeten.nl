'use client'

import {
	useEffect,
	useState,
	createContext,
	useContext,
	useCallback
} from 'react'
import { signOut, useSession } from '@/lib/auth-client'
import { VimStatusBar } from '@/components/vim-status-bar'
import { OAuthModal } from '@/components/auth/oauth-modal'
import { useVimCommand } from '@/hooks/use-vim-command'
import { OuterAuthGlow } from '../ui/effects/ouder-auth-glow'
import { useBlogFilter } from '@/hooks/use-blog-filter'
const ALLOWED_GITHUB_USERNAME = 'remcostoeten'

type VimAuthContextType = {
	openAuthModal: () => void
}

type Props = {
	children: React.ReactNode
}

export const VimAuthContext = createContext<VimAuthContextType | undefined>(
	undefined
)

export function useVimAuth() {
	const context = useContext(VimAuthContext)
	if (context === undefined) {
		throw new Error('useVimAuth must be used within a VimAuthProvider')
	}
	return context
}

export function VimAuthProvider({ children }: Props) {
	const { data: session } = useSession()
	const [showOAuthModal, setShowOAuthModal] = useState(false)
	const { command: backgroundCommand, clearCommand: clearBackgroundCommand } =
		useVimCommand()

	const openAuthModal = useCallback(() => setShowOAuthModal(true), [])

	const handleCommand = useCallback(
		async (command: string) => {
			const cmd = command.toLowerCase().trim()

			if ((cmd === 'signin' || cmd === 'login') && !session) {
				// Show the modal
				setShowOAuthModal(true)
			} else if ((cmd === 'signout' || cmd === 'logout') && session) {
				await signOut()
			}
		},
		[session]
	)

	useEffect(() => {
		if (backgroundCommand) {
			handleCommand(backgroundCommand)
			clearBackgroundCommand()
		}
	}, [backgroundCommand, clearBackgroundCommand, handleCommand])

	useEffect(() => {
		if (session?.user) {
			const isAllowed =
				session.user.name?.toLowerCase() === ALLOWED_GITHUB_USERNAME

			if (!isAllowed) {
				console.warn(
					'Unauthorized user attempted login, signing out...'
				)
				signOut()
			}
		}
	}, [session])

	return (
		<VimAuthContext.Provider value={{ openAuthModal }}>
			{children}
			<VimStatusBar onCommand={handleCommand} />

			<OAuthModal
				isOpen={showOAuthModal}
				onClose={() => setShowOAuthModal(false)}
				provider="github"
			/>

			{session?.user && <OuterAuthGlow />}
		</VimAuthContext.Provider>
	)
}

'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from '@/lib/auth-client'
import { VimStatusBar } from '@/components/vim-status-bar'
import { OAuthModal } from '@/components/auth/oauth-modal'
import { useVimCommand } from '@/hooks/use-vim-command'
import { useBlogFilter } from '@/hooks/use-blog-filter'
import { OuterAuthGlow } from '../ui/effects/ouder-auth-glow'

type Props = {
	children: React.ReactNode
}

export function VimAuthProvider({ children }: Props) {
	const { data: session } = useSession()
	const [showOAuthModal, setShowOAuthModal] = useState(false)
	const { setFilter } = useBlogFilter()
	const { command: backgroundCommand, clearCommand: clearBackgroundCommand } =
		useVimCommand()

	const handleCommand = async (command: string) => {
		const cmd = command.toLowerCase().trim()

		if ((cmd === 'signin' || cmd === 'login') && !session) {
			// Show the modal
			setShowOAuthModal(true)
		} else if ((cmd === 'signout' || cmd === 'logout') && session) {
			await signOut()
		} else if (cmd === 'showdrafts' || cmd === 'show drafts') {
			setFilter('drafts')
		} else if (cmd === 'showpublished' || cmd === 'show published') {
			setFilter('published')
		} else if (cmd === 'showall' || cmd === 'show all') {
			setFilter('all')
		}
	}

	useEffect(() => {
		if (backgroundCommand) {
			handleCommand(backgroundCommand)
			clearBackgroundCommand()
		}
	}, [backgroundCommand, clearBackgroundCommand])

	return (
		<>
			<div
				inert={showOAuthModal ? true : undefined}
				// aria-hidden is also good practice when inert is used for accessibility
				aria-hidden={showOAuthModal}
			>
				{children}
				<VimStatusBar onCommand={handleCommand} />
				{session?.user && <OuterAuthGlow />}
			</div>

			<OAuthModal
				isOpen={showOAuthModal}
				onClose={() => setShowOAuthModal(false)}
				provider="github"
			/>
		</>
	)
}

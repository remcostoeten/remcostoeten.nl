'use client'

import { useEffect, useState } from 'react'
import { signOut, type SessionUser } from '@/features/auth/client'
import { OptionalSession } from '@/features/auth/optional-session'
import { VimStatusBar } from '@/components/vim-status-bar'
import { OAuthModal } from '@/components/auth/oauth-modal'
import { useVimCommand } from '@/hooks/use-vim-command'
import { useBlogFilter } from '@/hooks/use-blog-filter'
import { OuterAuthGlow } from '../ui/effects/ouder-auth-glow'

type Props = {
	children?: React.ReactNode
}

type ContentProps = Props & {
	user: SessionUser | null
}

export function VimAuthProvider({ children }: Props) {
	return (
		<OptionalSession>
			{({ user }) => (
				<VimAuthContent user={user}>{children}</VimAuthContent>
			)}
		</OptionalSession>
	)
}

function VimAuthContent({ children, user }: ContentProps) {
	const [showOAuthModal, setShowOAuthModal] = useState(false)
	const { setFilter } = useBlogFilter()
	const { command: backgroundCommand, clearCommand: clearBackgroundCommand } =
		useVimCommand()

	const handleCommand = async (command: string) => {
		const cmd = command.toLowerCase().trim()

		if ((cmd === 'signin' || cmd === 'login') && !user) {
			// Show the modal
			setShowOAuthModal(true)
		} else if ((cmd === 'signout' || cmd === 'logout') && user) {
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
				<VimStatusBar onCommand={handleCommand} user={user} />
				{user && <OuterAuthGlow />}
			</div>

			<OAuthModal
				isOpen={showOAuthModal}
				onClose={() => setShowOAuthModal(false)}
				provider="github"
			/>
		</>
	)
}

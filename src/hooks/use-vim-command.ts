'use client'

import { useEffect, useState, useCallback } from 'react'

type VimCommand =
	| 'signin'
	| 'signout'
	| 'showdrafts'
	| 'showpublished'
	| 'showall'
	| null

/**
 * Hook that listens for Vim-style commands typed anywhere on the page.
 * Supports:
 * - :signin, :sign in, : sign in (triggers sign-in)
 * - :signout, :sign out, : sign out (triggers sign-out)
 * - :show drafts, :show published, :show all (sets blog filters)
 */
export function useVimCommand() {
	const [command, setCommand] = useState<VimCommand>(null)
	const [buffer, setBuffer] = useState('')

	const clearCommand = useCallback(() => {
		setCommand(null)
	}, [])

	useEffect(() => {
		let timeout: NodeJS.Timeout

		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				(e.target as HTMLElement)?.isContentEditable
			) {
				return
			}

			if (e.key === 'Escape') {
				if (buffer) {
					setBuffer('')
				}
				return
			}

			if (!buffer && e.key !== ':') {
				return
			}

			if (
				e.key.length > 1 &&
				e.key !== 'Escape' &&
				e.key !== 'Backspace'
			) {
				return
			}

			clearTimeout(timeout)
			timeout = setTimeout(() => {
				if (buffer) {
					setBuffer('')
				}
			}, 2000)

			// Build buffer
			const char = e.key.toLowerCase()
			const newBuffer = buffer + char
			setBuffer(newBuffer)

			// Normalize: remove spaces for matching
			const normalized = newBuffer.replace(/\s+/g, '')

			// Check for sign-in patterns: :signin, :sign in, :login
			if (
				normalized.includes(':signin') ||
				normalized.includes(':login')
			) {
				setCommand('signin')
				setBuffer('')
				return
			}

			// Check for sign-out patterns: :signout, :sign out, :logout
			if (
				normalized.includes(':signout') ||
				normalized.includes(':logout')
			) {
				setCommand('signout')
				setBuffer('')
				return
			}

			if (normalized.includes(':showdrafts')) {
				setCommand('showdrafts')
				setBuffer('')
				return
			}

			if (normalized.includes(':showpublished')) {
				setCommand('showpublished')
				setBuffer('')
				return
			}

			if (normalized.includes(':showall')) {
				setCommand('showall')
				setBuffer('')
				return
			}

			// Limit buffer size - if it gets too long without a match, it's likely not a command
			if (newBuffer.length > 20) {
				setBuffer('')
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			clearTimeout(timeout)
		}
	}, [buffer])

	return { command, clearCommand }
}

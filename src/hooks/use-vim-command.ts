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
					console.log('[vim-cmd] Buffer cleared (Escape pressed)')
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
					console.log('[vim-cmd] Buffer cleared (timeout)')
					setBuffer('')
				}
			}, 2000)

			// Build buffer
			const char = e.key.toLowerCase()
			const newBuffer = buffer + char
			setBuffer(newBuffer)

			// ONLY log if we're in command mode (buffer exists)
			console.log(`[vim-cmd] Sequence: "${newBuffer}"`)

			// Normalize: remove spaces for matching
			const normalized = newBuffer.replace(/\s+/g, '')

			// Check for sign-in patterns: :signin, :sign in, :login
			if (
				normalized.includes(':signin') ||
				normalized.includes(':login')
			) {
				console.log(
					'[vim-cmd] ✓ SUCCESS: :signin/:login command detected'
				)
				setCommand('signin')
				setBuffer('')
				return
			}

			// Check for sign-out patterns: :signout, :sign out, :logout
			if (
				normalized.includes(':signout') ||
				normalized.includes(':logout')
			) {
				console.log(
					'[vim-cmd] ✓ SUCCESS: :signout/:logout command detected'
				)
				setCommand('signout')
				setBuffer('')
				return
			}

			if (normalized.includes(':showdrafts')) {
				console.log('[vim-cmd] ✓ SUCCESS: :show drafts command detected')
				setCommand('showdrafts')
				setBuffer('')
				return
			}

			if (normalized.includes(':showpublished')) {
				console.log(
					'[vim-cmd] ✓ SUCCESS: :show published command detected'
				)
				setCommand('showpublished')
				setBuffer('')
				return
			}

			if (normalized.includes(':showall')) {
				console.log('[vim-cmd] ✓ SUCCESS: :show all command detected')
				setCommand('showall')
				setBuffer('')
				return
			}

			// Limit buffer size - if it gets too long without a match, it's likely not a command
			if (newBuffer.length > 20) {
				console.log('[vim-cmd] Buffer cleared (no match)')
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

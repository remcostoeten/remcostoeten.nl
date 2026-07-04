'use client'

import { useEffect } from 'react'

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target.isContentEditable
	)
}

/**
 * Routes Ctrl/Cmd+V pastes that happen outside any editable element into the
 * provided handler, so users can paste into the editor from anywhere on the
 * page.
 */
export function useGlobalPaste(onPaste: (text: string) => void): void {
	useEffect(() => {
		function handlePaste(event: ClipboardEvent) {
			if (isEditableTarget(event.target)) return
			const text = event.clipboardData?.getData('text/plain')
			if (!text) return
			event.preventDefault()
			onPaste(text)
		}

		document.addEventListener('paste', handlePaste)
		return () => document.removeEventListener('paste', handlePaste)
	}, [onPaste])
}

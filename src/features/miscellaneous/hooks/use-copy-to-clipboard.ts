'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Copies text to the clipboard and reports which key was copied last, so
 * callers can render a transient "copied" affordance per row.
 */
export function useCopyToClipboard(resetAfterMs = 1500) {
	const [copiedKey, setCopiedKey] = useState<string | null>(null)
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeout.current) clearTimeout(timeout.current)
		}
	}, [])

	const copy = useCallback(
		async (value: string, key: string, label = 'Copied') => {
			try {
				await navigator.clipboard.writeText(value)
				setCopiedKey(key)
				toast.success(label)
				if (timeout.current) clearTimeout(timeout.current)
				timeout.current = setTimeout(() => setCopiedKey(null), resetAfterMs)
			} catch (error) {
				console.warn('Clipboard write failed', error)
				toast.error('Could not copy to clipboard')
			}
		},
		[resetAfterMs]
	)

	return { copy, copiedKey }
}

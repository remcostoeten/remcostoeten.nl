import { useState } from 'react'

export function useClipboard() {
	const [message, setMessage] = useState('')

	async function read(): Promise<string | undefined> {
		try {
			const text = await navigator.clipboard.readText()
			setMessage('')
			return text
		} catch {
			setMessage(
				'Clipboard access was denied. Paste the SVG manually instead.'
			)
			return undefined
		}
	}

	async function copy(text: string): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(text)
			setMessage('Copied to clipboard.')
			return true
		} catch {
			setMessage(
				'Clipboard access was denied. Copy the output manually instead.'
			)
			return false
		}
	}

	return { read, copy, message, setMessage }
}

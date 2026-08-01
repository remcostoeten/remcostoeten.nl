export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = filename
	anchor.click()
	setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function downloadText(content: string, filename: string): void {
	downloadBlob(
		new Blob([content], { type: 'text/typescript;charset=utf-8' }),
		filename
	)
}

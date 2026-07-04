import { sanitizeWorkspaces } from './storage'
import type { TSnapshot, TWorkspace } from '../types'

export function downloadFile(
	filename: string,
	content: string,
	mimeType: string
): void {
	const blob = new Blob([content], { type: mimeType })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = filename
	anchor.click()
	URL.revokeObjectURL(url)
}

export function downloadText(filename: string, content: string): void {
	downloadFile(filename, content, 'text/plain;charset=utf-8')
}

function csvEscape(value: string): string {
	return `"${value.replace(/"/g, '""')}"`
}

export function snapshotToMarkdown(snapshot: TSnapshot): string {
	return [
		`# ${snapshot.label}`,
		'',
		`- Created: ${new Date(snapshot.createdAt).toISOString()}`,
		`- Search: \`${snapshot.search}\``,
		`- Replace: \`${snapshot.replace}\``,
		`- Replacements: ${snapshot.replacementCount}`,
		'',
		'## Original',
		'',
		'```',
		snapshot.input,
		'```',
		'',
		'## Output',
		'',
		'```',
		snapshot.output,
		'```',
		''
	].join('\n')
}

export function snapshotsToCsv(snapshots: TSnapshot[]): string {
	const header = 'label,created,search,replace,replacements'
	const rows = snapshots.map(snapshot =>
		[
			csvEscape(snapshot.label),
			csvEscape(new Date(snapshot.createdAt).toISOString()),
			csvEscape(snapshot.search),
			csvEscape(snapshot.replace),
			String(snapshot.replacementCount)
		].join(',')
	)
	return [header, ...rows].join('\n')
}

export function exportWorkspaces(workspaces: TWorkspace[]): void {
	downloadFile(
		'find-replace-workspaces.json',
		JSON.stringify({ version: 1, workspaces }, null, 2),
		'application/json'
	)
}

export function parseImportedWorkspaces(raw: string): TWorkspace[] {
	const parsed = JSON.parse(raw) as { workspaces?: unknown }
	return sanitizeWorkspaces(
		Array.isArray(parsed) ? parsed : parsed.workspaces
	)
}

export function printText(title: string, content: string): void {
	const printWindow = window.open('', '_blank', 'noopener,noreferrer')
	if (!printWindow) return
	const escaped = content
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	printWindow.document.write(
		`<!doctype html><html><head><title>${title}</title><style>body{font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;word-break:break-word;margin:2rem}</style></head><body>${escaped}</body></html>`
	)
	printWindow.document.close()
	printWindow.focus()
	printWindow.print()
}

import { toHref } from './links'

export type TOpenReport = {
	opened: string[]
	blocked: number
}

/**
 * Opens every url in a new tab. Stays synchronous on purpose — a `setTimeout`
 * between calls loses the user gesture and every tab after the first is blocked.
 */
export function openUrls(urls: readonly string[]): TOpenReport {
	const opened: string[] = []
	let blocked = 0

	for (const url of urls) {
		const tab = window.open(toHref(url), '_blank', 'noopener,noreferrer')
		if (tab === null) {
			blocked += 1
			continue
		}
		opened.push(url)
	}

	return { opened, blocked }
}

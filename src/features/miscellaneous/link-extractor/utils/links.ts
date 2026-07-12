const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`\\]+/gi

const TRAILING_PUNCTUATION = new Set([
	'.',
	',',
	';',
	':',
	'!',
	'?',
	'"',
	"'",
	'>',
	'*',
	'_',
	'~'
])

function countChar(text: string, char: string): number {
	let total = 0
	for (let index = 0; index < text.length; index += 1) {
		if (text[index] === char) total += 1
	}
	return total
}

/**
 * Strips punctuation a URL picked up from surrounding prose or markup —
 * a trailing bracket is only dropped when it has no opener inside the URL,
 * so `…/wiki/Foo_(bar)` survives while `[label](https://x.dev)` does not.
 */
function trimUrlEdges(candidate: string): string {
	let url = candidate
	while (url.length > 0) {
		const last = url[url.length - 1]
		if (TRAILING_PUNCTUATION.has(last)) {
			url = url.slice(0, -1)
			continue
		}
		if (last === ')' && countChar(url, '(') <= countChar(url, ')') - 1) {
			url = url.slice(0, -1)
			continue
		}
		if (last === ']' && countChar(url, '[') <= countChar(url, ']') - 1) {
			url = url.slice(0, -1)
			continue
		}
		if (last === '}' && countChar(url, '{') <= countChar(url, '}') - 1) {
			url = url.slice(0, -1)
			continue
		}
		break
	}
	return url
}

/**
 * @description Every URL found in `text`, in document order, duplicates included.
 */
export function extractUrls(text: string): string[] {
	const urls: string[] = []
	URL_PATTERN.lastIndex = 0
	let match = URL_PATTERN.exec(text)
	while (match !== null) {
		const url = trimUrlEdges(match[0])
		if (url.length > 0) urls.push(url)
		match = URL_PATTERN.exec(text)
	}
	return urls
}

/**
 * @description The first URL on a line, or `null` when the line has none.
 */
export function findUrl(line: string): string | null {
	const urls = extractUrls(line)
	return urls.length > 0 ? urls[0] : null
}

/**
 * @description A navigable href — bare `www.` hosts get an `https://` scheme.
 */
export function toHref(url: string): string {
	return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

/**
 * @description Host without the `www.` prefix, or the raw url when unparsable.
 */
export function hostOf(url: string): string {
	try {
		return new URL(toHref(url)).hostname.replace(/^www\./i, '')
	} catch {
		return url
	}
}

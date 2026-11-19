import { comOrigin, nlOrigin } from '../src/core/config/site'

type RewriterElement = {
	getAttribute(name: string): string | null
	setAttribute(name: string, value: string): void
}

declare class HTMLRewriter {
	on(
		selector: string,
		handlers: { element(element: RewriterElement): void }
	): HTMLRewriter
	transform(response: Response): Response
}

const TEXT_PATHS = new Set(['/sitemap.xml', '/robots.txt'])

/**
 * @name originForHost
 * @description Returns the public origin for the domain a request came in on, so .com requests stay on .com and everything else stays on .nl.
 * @example originForHost('remcostoeten.com') // 'https://www.remcostoeten.com'
 */
export function originForHost(hostname: string) {
	return hostname.endsWith('remcostoeten.com') ? comOrigin : nlOrigin
}

/**
 * @name swapOrigin
 * @description Replaces the .nl origin at the start of a value with the target origin.
 * @example swapOrigin('https://www.remcostoeten.nl/about', 'https://www.remcostoeten.com')
 */
export function swapOrigin(value: string, origin: string) {
	return value.startsWith(nlOrigin)
		? origin + value.slice(nlOrigin.length)
		: value
}

/**
 * @name localizeResponse
 * @description Points the canonical link, og:url, sitemap and robots output at the domain the visitor used, since the pages are rendered once with the .nl origin.
 * @example return localizeResponse(request, await handler.fetch(request, env, context))
 */
export async function localizeResponse(request: Request, response: Response) {
	const url = new URL(request.url)
	const origin = originForHost(url.hostname)

	if (origin === nlOrigin || !response.ok) {
		return response
	}

	const type = response.headers.get('content-type') ?? ''

	if (type.includes('text/html')) {
		return new HTMLRewriter()
			.on('link[rel="canonical"]', {
				element(element) {
					const href = element.getAttribute('href')
					if (href)
						element.setAttribute('href', swapOrigin(href, origin))
				}
			})
			.on('meta[property="og:url"]', {
				element(element) {
					const content = element.getAttribute('content')
					if (content)
						element.setAttribute(
							'content',
							swapOrigin(content, origin)
						)
				}
			})
			.transform(response)
	}

	if (TEXT_PATHS.has(url.pathname)) {
		const body = (await response.text()).replaceAll(nlOrigin, origin)
		const headers = new Headers(response.headers)
		headers.delete('content-length')
		return new Response(body, { status: response.status, headers })
	}

	return response
}

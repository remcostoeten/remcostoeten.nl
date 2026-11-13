import type { ReadonlyURLSearchParams } from 'next/navigation'
import type { LegalLanguage } from './legal-language'

/**
 * @name readLanguage
 * @description Reads a supported legal-page language from the URL.
 * @example readLanguage(new URLSearchParams('lang=nl'))
 */
export function readLanguage(
	searchParams: URLSearchParams | ReadonlyURLSearchParams
): LegalLanguage | null {
	const value = searchParams.get('lang')
	if (value === 'en' || value === 'nl') return value
	return null
}

/**
 * @name readStoredLanguage
 * @description Reads the legal-page language saved for this browser session.
 * @example const language = readStoredLanguage() ?? 'en'
 */
export function readStoredLanguage(): LegalLanguage | null {
	if (typeof window === 'undefined') return null
	const stored = window.sessionStorage.getItem('legal-lang')
	if (stored === 'en' || stored === 'nl') return stored
	return null
}

/**
 * @name storeLanguage
 * @description Saves the legal-page language for this browser session.
 * @example storeLanguage('nl')
 */
export function storeLanguage(language: LegalLanguage): void {
	if (typeof window === 'undefined') return
	window.sessionStorage.setItem('legal-lang', language)
}

/**
 * @name buildLanguageHref
 * @description Changes the legal-page language while preserving other query parameters.
 * @example buildLanguageHref('/privacy', searchParams, 'nl')
 */
export function buildLanguageHref(
	pathname: '/privacy' | '/terms',
	searchParams: ReadonlyURLSearchParams,
	language: LegalLanguage
) {
	const nextParams = new URLSearchParams(searchParams.toString())
	nextParams.set('lang', language)
	return `${pathname}?${nextParams.toString()}` as const
}

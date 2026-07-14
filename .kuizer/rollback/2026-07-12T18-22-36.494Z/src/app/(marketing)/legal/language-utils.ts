import { ReadonlyURLSearchParams } from 'next/navigation'
import { LegalLanguage } from './legal-language'

export function readLanguage(
	searchParams: URLSearchParams | ReadonlyURLSearchParams
): LegalLanguage | null {
	const value = searchParams.get('lang')
	if (value === 'en' || value === 'nl') return value
	return null
}

export function readStoredLanguage(): LegalLanguage | null {
	if (typeof window === 'undefined') return null
	const stored = window.sessionStorage.getItem('legal-lang')
	if (stored === 'en' || stored === 'nl') return stored
	return null
}

export function storeLanguage(language: LegalLanguage): void {
	if (typeof window === 'undefined') return
	window.sessionStorage.setItem('legal-lang', language)
}

export function buildLanguageHref(
	pathname: string,
	searchParams: ReadonlyURLSearchParams,
	language: LegalLanguage
): string {
	const nextParams = new URLSearchParams(searchParams.toString())
	nextParams.set('lang', language)
	const query = nextParams.toString()
	return query.length > 0 ? `${pathname}?${query}` : pathname
}

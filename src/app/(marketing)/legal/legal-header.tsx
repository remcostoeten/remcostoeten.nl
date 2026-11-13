'use client'

import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { LegalLanguage } from './legal-language'
import { buildLanguageHref, storeLanguage } from './language-utils'

interface HeaderProps {
	language: LegalLanguage
	onLanguageChange: (language: LegalLanguage) => void
	title: string
	updatedLabel: string
	lastUpdated: string
}

interface ToggleProps {
	label: string
	isActive: boolean
	onClick: () => void
}

export function LegalHeader({
	language,
	onLanguageChange,
	title,
	updatedLabel,
	lastUpdated
}: HeaderProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const currentPage = pathname === '/terms' ? '/terms' : '/privacy'
	const otherPage = currentPage === '/terms' ? '/privacy' : '/terms'
	const otherPageLabel =
		pathname === '/terms'
			? language === 'nl'
				? 'Privacyverklaring'
				: 'Privacy policy'
			: language === 'nl'
				? 'Gebruiksvoorwaarden'
				: 'Terms of service'
	const linkParams = new URLSearchParams(searchParams.toString())
	linkParams.set('lang', language)

	function changeLanguage(nextLanguage: LegalLanguage) {
		storeLanguage(nextLanguage)
		onLanguageChange(nextLanguage)
		router.replace(
			buildLanguageHref(currentPage, searchParams, nextLanguage),
			{ scroll: false }
		)
	}

	return (
		<header className="px-4 md:px-5">
			<h1 className="text-2xl font-semibold tracking-tight text-foreground">
				{title}
			</h1>
			<p className="mt-0.5 text-sm text-muted-foreground">
				{updatedLabel}: {lastUpdated}
			</p>
			<nav
				aria-label={
					language === 'nl'
						? "Juridische pagina's en taal"
						: 'Legal pages and language'
				}
				className="mt-6 flex flex-wrap items-center gap-3"
			>
				<Link
					href={{
						pathname: otherPage,
						search: `?${linkParams.toString()}`
					}}
					className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-none hover:bg-muted/50 transition-colors"
				>
					{otherPageLabel}
				</Link>
				<div
					role="group"
					aria-label={language === 'nl' ? 'Taal' : 'Language'}
					className="flex items-center gap-2"
				>
					<LanguageToggle
						label="EN"
						isActive={language === 'en'}
						onClick={() => changeLanguage('en')}
					/>
					<LanguageToggle
						label="NL"
						isActive={language === 'nl'}
						onClick={() => changeLanguage('nl')}
					/>
				</div>
			</nav>
		</header>
	)
}

function LanguageToggle({ label, isActive, onClick }: ToggleProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={isActive}
			className={`rounded-none border px-3 py-1.5 text-xs font-medium transition-colors ${
				isActive
					? 'border-border bg-muted/50 text-foreground'
					: 'border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
			}`}
		>
			{label}
		</button>
	)
}

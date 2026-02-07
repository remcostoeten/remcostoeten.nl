'use client'

import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Home } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { LegalLanguage } from './legal-language'

interface HeaderProps {
	language: LegalLanguage
	onLanguageChange: (language: LegalLanguage) => void
}

export function LegalHeader({ language, onLanguageChange }: HeaderProps) {
	const [isHidden, setIsHidden] = useState(false)
	const lastScroll = useRef(0)
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(function handleScrollDirection() {
		function handleScroll() {
			const current = window.scrollY
			const isMobile = window.innerWidth < 768
			if (!isMobile) {
				setIsHidden(false)
				lastScroll.current = current
				return
			}

			if (current > lastScroll.current && current > 32) {
				setIsHidden(true)
			} else {
				setIsHidden(false)
			}
			lastScroll.current = current
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		return function cleanup() {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	return (
		<div
			className={`sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur transition-transform duration-200 ${
				isHidden
					? '-translate-y-full md:translate-y-0'
					: 'translate-y-0'
			}`}
		>
			<div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
				<div className="flex flex-wrap items-center gap-3">
					{/* Navigation between legal pages */}
					{pathname === '/terms' && (
						<Button asChild variant="ghost" size="sm">
							<Link
								href={`/privacy${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
							>
								Privacy
							</Link>
						</Button>
					)}
					{pathname === '/privacy' && (
						<Button asChild variant="ghost" size="sm">
							<Link
								href={`/terms${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
							>
								Terms
							</Link>
						</Button>
					)}

					<Breadcrumbs />
				</div>
				<div className="flex items-center gap-2">
					<LanguageToggle
						label="EN"
						isActive={language === 'en'}
						onClick={handleEnglish}
					/>
					<LanguageToggle
						label="NL"
						isActive={language === 'nl'}
						onClick={handleDutch}
					/>
				</div>
			</div>
		</div>
	)

	function handleEnglish() {
		const params = new URLSearchParams(searchParams.toString())
		if (language === 'nl') {
			params.set('lang', 'en')
		} else {
			params.delete('lang')
		}
		const newUrl = `${window.location.pathname}?${params.toString()}`
		router.replace(newUrl, { scroll: false })
		onLanguageChange('en')
	}

	function handleDutch() {
		const params = new URLSearchParams(searchParams.toString())
		params.set('lang', 'nl')
		const newUrl = `${window.location.pathname}?${params.toString()}`
		router.replace(newUrl, { scroll: false })
		onLanguageChange('nl')
	}
}

interface ToggleProps {
	label: string
	isActive: boolean
	onClick: () => void
}

function LanguageToggle({ label, isActive, onClick }: ToggleProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={isActive}
			className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
				isActive
					? 'border-primary/70 bg-primary text-primary-foreground shadow-sm'
					: 'border-border/70 bg-background hover:border-primary/50 hover:text-foreground'
			}`}
		>
			{label}
		</button>
	)
}

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Section } from '@/components/ui/section'
import { LegalHeader } from '../legal/legal-header'
import type { LegalLanguage } from '../legal/legal-language'
import {
	readLanguage,
	readStoredLanguage,
	storeLanguage
} from '../legal/language-utils'

interface InfoSection {
	title: string
	details: string[]
	note?: string
}

interface CookieSection {
	title: string
	items: string[]
}

interface UsageItem {
	title: string
	detail: string
}

interface PrivacyCopy {
	title: string
	updatedLabel: string
	introTitle: string
	intro: string[]
	infoTitle: string
	infoSections: InfoSection[]
	usageTitle: string
	usageItems: UsageItem[]
	storageTitle: string
	storageLead: string
	storageItems: string[]
	storageNote: string
	cookiesTitle: string
	cookies: CookieSection[]
	rightsTitle: string
	rightsIntro: string
	rightsItems: string[]
	partnersTitle: string
	partnersIntro: string
	partnersItems: string[]
	contactTitle: string
	contactIntro: string
	contactNote: string
}

const sectionContentClassName =
	'px-4 md:px-5 pt-4 pb-6 space-y-4 text-sm text-muted-foreground/90 leading-relaxed'
const subsectionClassName =
	'border-t border-border/50 pt-4 first:border-t-0 first:pt-0'
const subheadingClassName = 'text-sm font-medium text-foreground mb-1'
const listClassName = 'list-disc pl-5 space-y-1'

const lastUpdatedByLanguage: Record<LegalLanguage, string> = {
	en: 'April 7, 2026',
	nl: '7 april 2026'
}

const privacyCopy: Record<LegalLanguage, PrivacyCopy> = {
	en: {
		title: 'Privacy policy',
		updatedLabel: 'Last updated',
		introTitle: 'About this policy',
		intro: [
			'I collect, use, and protect your information as described here when you visit remcostoeten.nl.',
			'I only collect the data I need to improve your experience on this site.'
		],
		infoTitle: 'What I collect',
		infoSections: [
			{
				title: 'Analytics data',
				details: [
					'Pages you visit and how long you stay.',
					'General location (country/city level, not precise).',
					'Browser type and screen size.',
					'Interaction with blog posts and features.'
				],
				note: 'This data is anonymized and never linked to your personal identity.'
			},
			{
				title: 'Sign-in data',
				details: [
					'Your GitHub username and profile picture.',
					'Email address (from your GitHub profile).',
					'Your blog reactions and comments.'
				],
				note: 'I only store what I need to sign you in and personalize the site.'
			},
			{
				title: 'Contact form data',
				details: [
					'When you contact me through the contact form, I receive your email address and message.',
					'I only use this data to reply to your message.'
				]
			},
			{
				title: 'Technical data',
				details: [
					'I collect technical data such as your IP address, browser headers, and cookies to keep the site secure and working.'
				]
			}
		],
		usageTitle: 'How I use your data',
		usageItems: [
			{
				title: 'Improve the website',
				detail: 'I use analytics to see which content is useful and where I can improve the site.'
			},
			{
				title: 'Personalize your experience',
				detail: 'I use GitHub sign-in to show your profile picture and remember your blog reactions.'
			},
			{
				title: 'Reply to messages',
				detail: 'I only use your contact information to respond to your messages.'
			},
			{
				title: 'Security and maintenance',
				detail: 'I use basic data to keep the site secure and running.'
			}
		],
		storageTitle: 'Storage and security',
		storageLead: 'Your data is stored securely on:',
		storageItems: [
			'Cloudflare: Site hosting and content delivery (global edge network).',
			'Neon: User data and blog interactions (EU data centers).',
			'GitHub: OAuth authentication data.'
		],
		storageNote:
			'I take reasonable steps to protect your data. I encrypt data in transit and limit access to personal information.',
		cookiesTitle: 'Cookies and tracking',
		cookies: [
			{
				title: 'Essential cookies',
				items: [
					'Authentication tokens (if logged in).',
					'Theme preference (light/dark mode).',
					'Session management.'
				]
			},
			{
				title: 'Analytics cookies',
				items: [
					'Cookies for anonymous usage tracking.',
					'You can opt out by disabling cookies in your browser or using the privacy settings.'
				]
			}
		],
		rightsTitle: 'Your rights',
		rightsIntro:
			'Under GDPR and other privacy laws, you have the right to:',
		rightsItems: [
			'Access: Request a copy of your personal data.',
			'Correction: Request correction of inaccurate data.',
			'Deletion: Request deletion of your personal data.',
			'Portability: Request your data in a machine-readable format.'
		],
		partnersTitle: 'Services I use',
		partnersIntro: 'I use these services from other providers:',
		partnersItems: [
			'GitHub: OAuth authentication.',
			'Cloudflare: Website hosting and content delivery.',
			'Neon: Database hosting for user data.'
		],
		contactTitle: 'Contact',
		contactIntro:
			'For questions about this policy or how I handle your data, contact me by email.',
		contactNote:
			'You can email me. I try to reply, but I cannot guarantee a response. You can also contact me on LinkedIn or GitHub.'
	},
	nl: {
		title: 'Privacyverklaring',
		updatedLabel: 'Laatst bijgewerkt',
		introTitle: 'Over deze verklaring',
		intro: [
			'Ik verzamel, gebruik en bescherm je gegevens zoals hier beschreven wanneer je remcostoeten.nl bezoekt.',
			'Ik verzamel alleen de gegevens die ik nodig heb om je ervaring op deze site te verbeteren.'
		],
		infoTitle: 'Welke gegevens ik verzamel',
		infoSections: [
			{
				title: 'Bezoekstatistieken',
				details: [
					"Pagina's die je bezoekt en hoe lang je blijft.",
					'Globale locatie (land/stad, niet exact).',
					'Browsertype en schermgrootte.',
					'Interacties met blogposts en functies.'
				],
				note: 'Deze gegevens zijn geanonimiseerd en worden nooit aan je identiteit gekoppeld.'
			},
			{
				title: 'Inloggegevens',
				details: [
					'Je GitHub-gebruikersnaam en profielfoto.',
					'E-mailadres (uit je GitHub-profiel).',
					'Je reacties en opmerkingen bij blogposts.'
				],
				note: 'Ik bewaar alleen wat ik nodig heb om je te laten inloggen en de site voor je te personaliseren.'
			},
			{
				title: 'Gegevens uit het contactformulier',
				details: [
					'Als je het contactformulier gebruikt, ontvang ik je e-mailadres en bericht.',
					'Ik gebruik deze gegevens alleen om op je bericht te reageren.'
				]
			},
			{
				title: 'Technische gegevens',
				details: [
					'Ik verzamel basisgegevens zoals je IP-adres, browserheaders en cookies voor de beveiliging en werking van de site.'
				]
			}
		],
		usageTitle: 'Hoe ik je gegevens gebruik',
		usageItems: [
			{
				title: 'De website verbeteren',
				detail: 'Ik gebruik bezoekstatistieken om te zien welke inhoud nuttig is en waar ik de site kan verbeteren.'
			},
			{
				title: 'Je ervaring personaliseren',
				detail: 'Ik gebruik GitHub om je te laten inloggen, je profielfoto te tonen en je blogreacties te onthouden.'
			},
			{
				title: 'Berichten beantwoorden',
				detail: 'Ik gebruik je contactgegevens alleen om op je berichten te reageren.'
			},
			{
				title: 'Beveiliging en onderhoud',
				detail: 'Ik gebruik basisgegevens om de site veilig en stabiel te houden.'
			}
		],
		storageTitle: 'Opslag en beveiliging',
		storageLead: 'Je gegevens worden veilig opgeslagen bij:',
		storageItems: [
			'Cloudflare: Websitehosting en contentlevering (wereldwijd edge-netwerk).',
			'Neon: Gebruikersgegevens en bloginteracties (EU-datacenters).',
			'GitHub: OAuth-authenticatiegegevens.'
		],
		storageNote:
			'Ik neem redelijke maatregelen om je gegevens te beschermen. Ik versleutel gegevens bij overdracht en beperk de toegang tot persoonsgegevens.',
		cookiesTitle: 'Cookies en tracking',
		cookies: [
			{
				title: 'Essentiële cookies',
				items: [
					'Authenticatietokens (als je bent ingelogd).',
					'Themapreferentie (licht/donker).',
					'Sessiebeheer.'
				]
			},
			{
				title: 'Cookies voor bezoekstatistieken',
				items: [
					'Cookies voor anonieme gebruiksstatistieken.',
					'Je kunt dit uitschakelen via je browserinstellingen of privacy-instellingen.'
				]
			}
		],
		rightsTitle: 'Je rechten',
		rightsIntro: 'Onder de AVG en andere privacywetten heb je recht op:',
		rightsItems: [
			'Inzage: vraag een kopie van je persoonsgegevens op.',
			'Correctie: verzoek om onjuiste gegevens te corrigeren.',
			'Verwijdering: verzoek om je persoonsgegevens te verwijderen.',
			'Overdraagbaarheid: vraag je gegevens op in een machinaal leesbaar formaat.'
		],
		partnersTitle: 'Diensten die ik gebruik',
		partnersIntro: 'Ik gebruik deze diensten van andere aanbieders:',
		partnersItems: [
			'GitHub: OAuth-authenticatie.',
			'Cloudflare: Websitehosting en contentlevering.',
			'Neon: Databasehosting voor gebruikersgegevens.'
		],
		contactTitle: 'Contact',
		contactIntro:
			'Voor vragen over deze verklaring of hoe ik met je gegevens omga, kun je me mailen.',
		contactNote:
			'Je kunt me mailen. Ik probeer te antwoorden, maar kan geen reactie garanderen. Je kunt ook contact opnemen via LinkedIn of GitHub.'
	}
}

export default function PrivacyContent() {
	const searchParams = useSearchParams()
	const [language, setLanguage] = useState<LegalLanguage>('en')

	useEffect(() => {
		const nextLanguage =
			readLanguage(searchParams) ?? readStoredLanguage() ?? 'en'
		setLanguage(nextLanguage)
		storeLanguage(nextLanguage)
	}, [searchParams])

	const copy = privacyCopy[language]

	return (
		<div lang={language} className="space-y-6">
			<LegalHeader
				language={language}
				onLanguageChange={setLanguage}
				title={copy.title}
				updatedLabel={copy.updatedLabel}
				lastUpdated={lastUpdatedByLanguage[language]}
			/>

			<Section title={copy.introTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.intro.map(paragraph => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
			</Section>

			<Section title={copy.infoTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.infoSections.map(info => (
						<div key={info.title} className={subsectionClassName}>
							<h3 className={subheadingClassName}>
								{info.title}
							</h3>
							<ul className={listClassName}>
								{info.details.map(detail => (
									<li key={detail}>{detail}</li>
								))}
							</ul>
							{info.note && <p className="mt-3">{info.note}</p>}
						</div>
					))}
				</div>
			</Section>

			<Section title={copy.usageTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.usageItems.map(item => (
						<div key={item.title} className={subsectionClassName}>
							<h3 className={subheadingClassName}>
								{item.title}
							</h3>
							<p>{item.detail}</p>
						</div>
					))}
				</div>
			</Section>

			<Section title={copy.storageTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.storageLead}</p>
					<ul className={listClassName}>
						{copy.storageItems.map(item => (
							<li key={item}>{item}</li>
						))}
					</ul>
					<p>{copy.storageNote}</p>
				</div>
			</Section>

			<Section title={copy.cookiesTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.cookies.map(cookieSection => (
						<div
							key={cookieSection.title}
							className={subsectionClassName}
						>
							<h3 className={subheadingClassName}>
								{cookieSection.title}
							</h3>
							<ul className={listClassName}>
								{cookieSection.items.map(item => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</Section>

			<Section title={copy.rightsTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.rightsIntro}</p>
					<ul className={listClassName}>
						{copy.rightsItems.map(item => (
							<li key={item}>{item}</li>
						))}
					</ul>
					<p className="break-words">
						stoetenremco [dot] rs [at] gmail [dot] com
					</p>
				</div>
			</Section>

			<Section title={copy.partnersTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.partnersIntro}</p>
					<ul className={listClassName}>
						{copy.partnersItems.map(item => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>
			</Section>

			<Section title={copy.contactTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.contactIntro}</p>
					<p>{copy.contactNote}</p>
					<p className="break-words">
						stoetenremco [dot] rs [at] gmail [dot] com
					</p>
				</div>
			</Section>
		</div>
	)
}

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

interface ActionItem {
	title: string
	body: string
}

interface BulletItem {
	label: string
}

interface SectionCopy {
	heading: string
	summary: string[]
}

interface TermsCopy {
	title: string
	overviewTitle: string
	canDoTitle: string
	avoidTitle: string
	contentTitle: string
	fairUseTitle: string
	authTitle: string
	privacyTitle: string
	disclaimerTitle: string
	accuracyTitle: string
	adviceTitle: string
	availabilityTitle: string
	liabilityTitle: string
	changesTitle: string
	contactTitle: string
	updatedLabel: string
	overview: string[]
	license: string
	canDo: ActionItem[]
	cannotDo: ActionItem[]
	myContent: SectionCopy
	userContent: SectionCopy
	fairUse: string
	authIntro: string
	authBullets: BulletItem[]
	authNote: string
	privacyIntro: string
	privacyBullets: BulletItem[]
	privacyNote: string
	accuracy: string
	advice: string
	availability: string
	availabilityBullets: BulletItem[]
	availabilityNote: string
	liabilityIntro: string
	liabilityBullets: BulletItem[]
	liabilityNote: string
	changes: string[]
	contact: string
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

const termsCopy: Record<LegalLanguage, TermsCopy> = {
	en: {
		title: 'Terms of service',
		overviewTitle: 'Overview',
		canDoTitle: 'What you can do',
		avoidTitle: 'What you should avoid',
		contentTitle: 'Content and intellectual property',
		fairUseTitle: 'Fair use',
		authTitle: 'GitHub sign-in',
		privacyTitle: 'Privacy and data',
		disclaimerTitle: 'Disclaimers',
		accuracyTitle: 'Content accuracy',
		adviceTitle: 'No professional advice',
		availabilityTitle: 'Site availability',
		liabilityTitle: 'Limits on liability',
		changesTitle: 'Changes to these terms',
		contactTitle: 'Contact',
		updatedLabel: 'Last updated',
		overview: [
			'These terms apply to my personal website and blog, remcostoeten.nl. By accessing or using the site, you agree to them.',
			'I run this portfolio and blog as a developer sharing my work and thoughts. I am not a company.'
		],
		license:
			'The content and code samples here use the MIT license unless a page says otherwise. You can copy, reuse, or remix them if you keep the license and attribution intact.',
		canDo: [
			{
				title: 'Read and share content',
				body: 'You can read, share, and discuss my posts. I appreciate a link back.'
			},
			{
				title: 'Reuse code',
				body: 'Code snippets and examples are MIT licensed unless a specific file says otherwise.'
			},
			{
				title: 'Interact',
				body: 'You can leave thoughtful comments and reactions on blog posts by signing in with GitHub.'
			},
			{
				title: 'Contact',
				body: 'You can contact me with questions, collaboration opportunities, or feedback.'
			}
		],
		cannotDo: [
			{
				title: 'Remove attribution',
				body: 'Do not strip the MIT license or misrepresent authorship of code or articles.'
			},
			{
				title: 'Abuse the platform',
				body: 'No spamming, harassment, or inappropriate behavior in comments or contact forms.'
			},
			{
				title: 'Careless automated scraping',
				body: 'Use scrapers responsibly. Do not overload the site or bypass its protections.'
			},
			{
				title: 'Security bypass',
				body: 'Do not try to bypass security controls or reverse engineer private features.'
			}
		],
		myContent: {
			heading: 'My content',
			summary: [
				'I own the intellectual property in my blog posts, tutorials, and original content. Unless noted otherwise, you can reuse them under the MIT license with attribution.',
				'When reusing, keep the license intact and credit remcostoeten.nl.'
			]
		},
		userContent: {
			heading: 'Your content',
			summary: [
				'You own your comments and reactions. By posting them, you allow me to display them on this site.',
				'You are responsible for what you post.'
			]
		},
		fairUse:
			'You can quote and share limited amounts for education, commentary, or criticism under fair use principles, with proper attribution.',
		authIntro: 'I use GitHub OAuth for sign-in. When you sign in:',
		authBullets: [
			{ label: 'You connect your GitHub account to this site.' },
			{
				label: 'Your public profile information is displayed with your comments.'
			},
			{ label: "You agree to GitHub's Terms of Service." },
			{
				label: 'You can revoke access anytime from your GitHub settings.'
			}
		],
		authNote:
			'I only access the minimum information needed for authentication and personalization.',
		privacyIntro: 'My privacy policy explains:',
		privacyBullets: [
			{ label: 'What data I collect and why.' },
			{ label: 'How I use and protect your information.' },
			{ label: 'Your rights regarding your data.' }
		],
		privacyNote:
			'By using this site, you consent to the data collection described in my privacy policy.',
		accuracy:
			'I try to keep information accurate, but it may contain errors or become outdated. Technical tutorials might not work in every environment. Use this content at your own risk.',
		advice: 'I write about my own opinions and experiences on this personal blog. The content is not professional advice or guidance.',
		availability:
			'I run this as a personal website, not a commercial service. I try to keep it running, but:',
		availabilityBullets: [
			{ label: 'No uptime guarantees or service level agreements.' },
			{ label: 'Temporary downtime for maintenance may occur.' },
			{ label: 'Features may change or be removed without notice.' }
		],
		availabilityNote: 'I provide this service as is, without warranties.',
		liabilityIntro: 'To the fullest extent permitted by law:',
		liabilityBullets: [
			{ label: 'I am not liable for damages arising from site use.' },
			{ label: 'I am not responsible for third-party content or links.' },
			{ label: 'I am not liable for code issues in tutorials.' }
		],
		liabilityNote:
			'This is a personal project. Use it responsibly and at your own risk.',
		changes: [
			'I may update these terms from time to time. Changes take effect as soon as I publish them. If you keep using the site, you accept the updated terms.',
			'I will announce major changes in a blog post or notice on the site.'
		],
		contact:
			'You can email me. I try to reply, but I cannot guarantee a response. You can also contact me on LinkedIn or GitHub.'
	},
	nl: {
		title: 'Gebruiksvoorwaarden',
		overviewTitle: 'Over deze voorwaarden',
		canDoTitle: 'Wat je mag doen',
		avoidTitle: 'Wat je beter vermijdt',
		contentTitle: 'Inhoud en intellectueel eigendom',
		fairUseTitle: 'Fair use',
		authTitle: 'Inloggen met GitHub',
		privacyTitle: 'Privacy en gegevens',
		disclaimerTitle: 'Disclaimers',
		accuracyTitle: 'Nauwkeurigheid',
		adviceTitle: 'Geen professioneel advies',
		availabilityTitle: 'Beschikbaarheid',
		liabilityTitle: 'Aansprakelijkheid',
		changesTitle: 'Wijzigingen in de voorwaarden',
		contactTitle: 'Contact',
		updatedLabel: 'Laatst bijgewerkt',
		overview: [
			'Deze voorwaarden gelden voor mijn persoonlijke website en blog, remcostoeten.nl. Door de site te gebruiken ga je ermee akkoord.',
			'Ik beheer dit portfolio en blog als ontwikkelaar en deel hier mijn werk en ideeën. Ik ben geen bedrijf.'
		],
		license:
			'De inhoud en codevoorbeelden hier vallen onder de MIT-licentie, tenzij anders vermeld. Je mag ze kopiëren, hergebruiken of aanpassen als je de licentie en naamsvermelding behoudt.',
		canDo: [
			{
				title: 'Lezen en delen',
				body: 'Je mag mijn berichten lezen, delen en bespreken. Ik waardeer een link naar de site.'
			},
			{
				title: 'Code hergebruiken',
				body: 'Codefragmenten en voorbeelden zijn MIT-gelicentieerd tenzij een bestand anders aangeeft.'
			},
			{
				title: 'Reageren',
				body: 'Je kunt doordachte opmerkingen en reacties achterlaten door in te loggen met GitHub.'
			},
			{
				title: 'Contact opnemen',
				body: 'Je kunt contact opnemen met vragen, voorstellen voor samenwerking of feedback.'
			}
		],
		cannotDo: [
			{
				title: 'Naamsvermelding verwijderen',
				body: 'Verwijder de MIT-licentie niet en doe geen verkeerde voorstelling van auteurschap.'
			},
			{
				title: 'Misbruik van het platform',
				body: 'Geen spam, intimidatie of ongepast gedrag in reacties of contactformulieren.'
			},
			{
				title: 'Onzorgvuldig scrapen',
				body: 'Gebruik scrapers verantwoord. De site overbelasten of beveiliging omzeilen mag niet.'
			},
			{
				title: 'Beveiliging omzeilen',
				body: 'Probeer geen beveiligingsmaatregelen te omzeilen of de werking van privéfuncties via reverse engineering te achterhalen.'
			}
		],
		myContent: {
			heading: 'Mijn inhoud',
			summary: [
				'Mijn blogposts, tutorials en originele inhoud zijn mijn intellectuele eigendom. Tenzij anders vermeld mag je ze onder de MIT-licentie hergebruiken met naamsvermelding.',
				'Behoud bij hergebruik de licentie en vermeld remcostoeten.nl als bron.'
			]
		},
		userContent: {
			heading: 'Jouw inhoud',
			summary: [
				'Je blijft eigenaar van je reacties en waarderingen. Door ze te plaatsen geef je mij toestemming ze op deze site te tonen.',
				'Je bent zelf verantwoordelijk voor wat je plaatst.'
			]
		},
		fairUse:
			'Je mag beperkt citeren en delen voor onderwijs, commentaar of kritiek binnen de regels van fair use, met juiste naamsvermelding.',
		authIntro:
			'Deze site gebruikt GitHub OAuth voor authenticatie. Door in te loggen:',
		authBullets: [
			{ label: 'Koppel je je GitHub-account aan deze site.' },
			{
				label: 'Worden je openbare profielgegevens getoond bij reacties.'
			},
			{ label: 'Ga je akkoord met de GitHub Terms of Service.' },
			{
				label: 'Kun je toegang op elk moment intrekken via je GitHub-instellingen.'
			}
		],
		authNote:
			'Ik gebruik alleen de minimale gegevens die nodig zijn voor authenticatie en personalisatie.',
		privacyIntro: 'Mijn privacyverklaring beschrijft:',
		privacyBullets: [
			{ label: 'Welke gegevens ik verzamel en waarom.' },
			{ label: 'Hoe ik je gegevens gebruik en beveilig.' },
			{ label: 'Welke rechten je hebt over je gegevens.' }
		],
		privacyNote:
			'Door deze site te gebruiken ga je akkoord met de gegevensverwerking in mijn privacyverklaring.',
		accuracy:
			'Ik probeer de informatie nauwkeurig te houden, maar die kan fouten bevatten of verouderen. Technische tutorials werken mogelijk niet in elke omgeving. Gebruik deze inhoud op eigen risico.',
		advice: 'Ik schrijf op dit persoonlijke blog over mijn eigen mening en ervaring. De inhoud is geen professioneel advies.',
		availability:
			'Ik beheer dit als persoonlijke website, niet als commerciële dienst. Ik probeer de site draaiend te houden, maar:',
		availabilityBullets: [
			{
				label: 'Er zijn geen uptime-garanties of service level agreements.'
			},
			{ label: 'Tijdelijke downtime voor onderhoud kan voorkomen.' },
			{
				label: 'Functies kunnen zonder aankondiging veranderen of verdwijnen.'
			}
		],
		availabilityNote:
			'Ik bied deze dienst aan zoals hij is, zonder garanties.',
		liabilityIntro: 'Voor zover wettelijk toegestaan:',
		liabilityBullets: [
			{
				label: 'Ben ik niet aansprakelijk voor schade die voortkomt uit gebruik van de site.'
			},
			{
				label: 'Ben ik niet verantwoordelijk voor inhoud of links van derden.'
			},
			{
				label: 'Ben ik niet aansprakelijk voor codeproblemen in tutorials.'
			}
		],
		liabilityNote:
			'Dit is een persoonlijk project. Gebruik het verantwoord en op eigen risico.',
		changes: [
			'Ik kan deze voorwaarden af en toe bijwerken. Wijzigingen zijn direct van kracht na publicatie. Door de site te blijven gebruiken accepteer je de bijgewerkte voorwaarden.',
			'Grote wijzigingen kondig ik aan in een blogpost of melding op de site.'
		],
		contact:
			'Je kunt me mailen. Ik probeer te antwoorden, maar kan geen reactie garanderen. Je kunt ook contact opnemen via LinkedIn of GitHub.'
	}
}

export default function TermsContent() {
	const searchParams = useSearchParams()
	const [language, setLanguage] = useState<LegalLanguage>('en')

	useEffect(() => {
		const nextLanguage =
			readLanguage(searchParams) ?? readStoredLanguage() ?? 'en'
		setLanguage(nextLanguage)
		storeLanguage(nextLanguage)
	}, [searchParams])

	const copy = termsCopy[language]

	return (
		<div lang={language} className="space-y-6">
			<LegalHeader
				language={language}
				onLanguageChange={setLanguage}
				title={copy.title}
				updatedLabel={copy.updatedLabel}
				lastUpdated={lastUpdatedByLanguage[language]}
			/>

			<Section title={copy.overviewTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.overview.map(paragraph => (
						<p key={paragraph}>{paragraph}</p>
					))}
					<p>{copy.license}</p>
				</div>
			</Section>

			<Section title={copy.canDoTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.canDo.map(item => (
						<div key={item.title} className={subsectionClassName}>
							<h3 className={subheadingClassName}>
								{item.title}
							</h3>
							<p>{item.body}</p>
						</div>
					))}
				</div>
			</Section>

			<Section title={copy.avoidTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.cannotDo.map(item => (
						<div key={item.title} className={subsectionClassName}>
							<h3 className={subheadingClassName}>
								{item.title}
							</h3>
							<p>{item.body}</p>
						</div>
					))}
				</div>
			</Section>

			<Section title={copy.contentTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{[copy.myContent, copy.userContent].map(content => (
						<div
							key={content.heading}
							className={subsectionClassName}
						>
							<h3 className={subheadingClassName}>
								{content.heading}
							</h3>
							<div className="space-y-4">
								{content.summary.map(paragraph => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>
						</div>
					))}
					<div className={subsectionClassName}>
						<h3 className={subheadingClassName}>
							{copy.fairUseTitle}
						</h3>
						<p>{copy.fairUse}</p>
					</div>
				</div>
			</Section>

			<Section title={copy.authTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.authIntro}</p>
					<ul className={listClassName}>
						{copy.authBullets.map(item => (
							<li key={item.label}>{item.label}</li>
						))}
					</ul>
					<p>{copy.authNote}</p>
				</div>
			</Section>

			<Section title={copy.privacyTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.privacyIntro}</p>
					<ul className={listClassName}>
						{copy.privacyBullets.map(item => (
							<li key={item.label}>{item.label}</li>
						))}
					</ul>
					<p>{copy.privacyNote}</p>
				</div>
			</Section>

			<Section title={copy.disclaimerTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<div className={subsectionClassName}>
						<h3 className={subheadingClassName}>
							{copy.accuracyTitle}
						</h3>
						<p>{copy.accuracy}</p>
					</div>
					<div className={subsectionClassName}>
						<h3 className={subheadingClassName}>
							{copy.adviceTitle}
						</h3>
						<p>{copy.advice}</p>
					</div>
				</div>
			</Section>

			<Section title={copy.availabilityTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.availability}</p>
					<ul className={listClassName}>
						{copy.availabilityBullets.map(item => (
							<li key={item.label}>{item.label}</li>
						))}
					</ul>
					<p>{copy.availabilityNote}</p>
				</div>
			</Section>

			<Section title={copy.liabilityTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.liabilityIntro}</p>
					<ul className={listClassName}>
						{copy.liabilityBullets.map(item => (
							<li key={item.label}>{item.label}</li>
						))}
					</ul>
					<p>{copy.liabilityNote}</p>
				</div>
			</Section>

			<Section title={copy.changesTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					{copy.changes.map(paragraph => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
			</Section>

			<Section title={copy.contactTitle} noHeaderMargin>
				<div className={sectionContentClassName}>
					<p>{copy.contact}</p>
					<p className="break-words">
						stoetenremco [dot] rs [at] gmail [dot] com
					</p>
				</div>
			</Section>
		</div>
	)
}

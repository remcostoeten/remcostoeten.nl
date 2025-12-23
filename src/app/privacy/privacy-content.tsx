'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Cookie, Database, Eye, Mail, Shield, Users } from 'lucide-react'
import { Section, SubSection, TimelineItem } from '@/components/ui/section'
import { LegalHeader } from '../legal/legal-header'
import { LegalLanguage } from '../legal/legal-language'
import { buildLanguageHref, readLanguage, readStoredLanguage, storeLanguage } from '../legal/language-utils'

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
  indicator: string
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

const privacyCopy: Record<LegalLanguage, PrivacyCopy> = {
  en: {
    title: 'Privacy Policy',
    updatedLabel: 'Last updated',
    introTitle: 'Introduction',
    intro: [
      'This Privacy Policy explains how I collect, use, and protect your information when you visit remcostoeten.nl.',
      'I believe in transparency and only collect data that is necessary to improve your experience on this site.',
    ],
    infoTitle: 'Information I Collect',
    infoSections: [
      {
        title: 'Analytics Data',
        details: [
          'Pages you visit and how long you stay.',
          'General location (country/city level, not precise).',
          'Browser type and screen size.',
          'Interaction with blog posts and features.',
        ],
        note: 'This data is anonymized and never linked to your personal identity.',
      },
      {
        title: 'Authentication Data',
        details: [
          'Your GitHub username and profile picture.',
          'Email address (from your GitHub profile).',
          'Your blog reactions and comments.',
        ],
        note: 'I only store what is necessary for authentication and personalization.',
      },
      {
        title: 'Contact Form Data',
        details: [
          'When you contact me through the contact form, I receive your email address and message.',
          'This data is only used to respond to your inquiry.',
        ],
      },
      {
        title: 'Technical Data',
        details: [
          'Basic technical information like IP address, browser headers, and cookies are collected for security and site functionality.',
        ],
      },
    ],
    usageTitle: 'How I Use Your Data',
    usageItems: [
      { title: 'Improve the website', detail: 'Analytics help me understand what content is valuable and where to improve the user experience.', indicator: 'Analytics' },
      { title: 'Personalize your experience', detail: 'GitHub authentication allows me to show your profile picture and remember your blog reactions.', indicator: 'Identity' },
      { title: 'Communicate with you', detail: 'I only use your contact information to respond to your messages.', indicator: 'Contact' },
      { title: 'Security and maintenance', detail: 'Basic data helps keep the site secure and running smoothly.', indicator: 'Safety' },
    ],
    storageTitle: 'Data Storage and Security',
    storageLead: 'Your data is stored securely on:',
    storageItems: [
      'Vercel: Analytics and site hosting (EU/US data centers).',
      'Neon: User data and blog interactions (EU data centers).',
      'GitHub: OAuth authentication data.',
    ],
    storageNote: 'I take reasonable security measures to protect your data, including encryption for data transmission and limited access to personal information.',
    cookiesTitle: 'Cookies and Tracking',
    cookies: [
      {
        title: 'Essential Cookies',
        items: [
          'Authentication tokens (if logged in).',
          'Theme preference (light/dark mode).',
          'Session management.',
        ],
      },
      {
        title: 'Analytics Cookies',
        items: [
          'PostHog cookies for anonymous usage tracking.',
          'You can opt out by disabling cookies in your browser or using the privacy settings.',
        ],
      },
    ],
    rightsTitle: 'Your Rights',
    rightsIntro: 'Under GDPR and other privacy laws, you have the right to:',
    rightsItems: [
      'Access: Request a copy of your personal data.',
      'Correction: Request correction of inaccurate data.',
      'Deletion: Request deletion of your personal data.',
      'Portability: Request your data in a machine-readable format.',
    ],
    partnersTitle: 'Third-Party Services',
    partnersIntro: 'This site uses the following third-party services:',
    partnersItems: [
      'GitHub: OAuth authentication.',
      'PostHog: Analytics and user behavior tracking.',
      'Vercel: Website hosting and performance monitoring.',
      'Neon: Database hosting for user data.',
    ],
    contactTitle: 'Contact',
    contactIntro: 'If you have questions about this Privacy Policy or how I handle your data:',
    contactNote: 'You can reach out via mail. I will try to reply but cannot guarantee a response. Other channels are LinkedIn or GitHub.',
  },
  nl: {
    title: 'Privacyverklaring',
    updatedLabel: 'Laatst bijgewerkt',
    introTitle: 'Introductie',
    intro: [
      'Deze privacyverklaring legt uit hoe ik gegevens verzamel, gebruik en bescherm wanneer je remcostoeten.nl bezoekt.',
      'Ik geloof in transparantie en verzamel alleen data die nodig is om je ervaring op deze site te verbeteren.',
    ],
    infoTitle: 'Welke informatie ik verzamel',
    infoSections: [
      {
        title: 'Analytics-data',
        details: [
          'Pagina’s die je bezoekt en hoe lang je blijft.',
          'Globale locatie (land/stad, niet exact).',
          'Browsertype en schermgrootte.',
          'Interacties met blogposts en functies.',
        ],
        note: 'Deze data is geanonimiseerd en wordt nooit gekoppeld aan je identiteit.',
      },
      {
        title: 'Authenticatiedata',
        details: [
          'Je GitHub-gebruikersnaam en profielfoto.',
          'E-mailadres (uit je GitHub-profiel).',
          'Je blogreacties en comments.',
        ],
        note: 'Ik bewaar alleen wat nodig is voor authenticatie en personalisatie.',
      },
      {
        title: 'Contactformulier-data',
        details: [
          'Wanneer je via het contactformulier reageert, ontvang ik je e-mailadres en bericht.',
          'Deze data wordt alleen gebruikt om op je bericht te reageren.',
        ],
      },
      {
        title: 'Technische data',
        details: [
          'Basisgegevens zoals IP-adres, browserheaders en cookies voor veiligheid en functionaliteit.',
        ],
      },
    ],
    usageTitle: 'Hoe ik je data gebruik',
    usageItems: [
      { title: 'De website verbeteren', detail: 'Analytics laten zien welke content waardevol is en waar de ervaring beter kan.', indicator: 'Analytics' },
      { title: 'Je ervaring personaliseren', detail: 'GitHub-authenticatie toont je profielfoto en onthoudt je blogreacties.', indicator: 'Identiteit' },
      { title: 'Met je communiceren', detail: 'Ik gebruik je contactgegevens alleen om op je berichten te reageren.', indicator: 'Contact' },
      { title: 'Beveiliging en onderhoud', detail: 'Basisdata helpt de site veilig en stabiel te houden.', indicator: 'Veiligheid' },
    ],
    storageTitle: 'Dataopslag en beveiliging',
    storageLead: 'Je data wordt veilig opgeslagen bij:',
    storageItems: [
      'Vercel: Analytics en hosting (EU/VS datacenters).',
      'Neon: Gebruikersdata en bloginteracties (EU datacenters).',
      'GitHub: OAuth-authenticatiegegevens.',
    ],
    storageNote: 'Ik tref redelijke beveiligingsmaatregelen om je data te beschermen, waaronder versleuteling bij overdracht en beperkte toegang tot persoonsgegevens.',
    cookiesTitle: 'Cookies en tracking',
    cookies: [
      {
        title: 'Essentiële cookies',
        items: [
          'Authenticatietokens (als je bent ingelogd).',
          'Themapreferentie (licht/donker).',
          'Sessiebeheer.',
        ],
      },
      {
        title: 'Analytics-cookies',
        items: [
          'PostHog-cookies voor anonieme gebruiksstatistieken.',
          'Je kunt dit uitschakelen via je browserinstellingen of privacy-instellingen.',
        ],
      },
    ],
    rightsTitle: 'Je rechten',
    rightsIntro: 'Onder de AVG en andere privacywetten heb je recht op:',
    rightsItems: [
      'Inzage: vraag een kopie van je persoonsgegevens op.',
      'Correctie: verzoek om onjuiste gegevens te corrigeren.',
      'Verwijdering: verzoek om je persoonsgegevens te verwijderen.',
      'Overdraagbaarheid: vraag je data op in een machinaal leesbaar formaat.',
    ],
    partnersTitle: 'Diensten van derden',
    partnersIntro: 'Deze site gebruikt de volgende diensten van derden:',
    partnersItems: [
      'GitHub: OAuth-authenticatie.',
      'PostHog: Analytics en gebruiksanalyse.',
      'Vercel: Websitehosting en prestatiemonitoring.',
      'Neon: Databasehosting voor gebruikersdata.',
    ],
    contactTitle: 'Contact',
    contactIntro: 'Heb je vragen over deze privacyverklaring of hoe ik met data omga?',
    contactNote: 'Je kunt per mail contact opnemen. Ik probeer te antwoorden maar kan geen reactie garanderen. Andere kanalen zijn LinkedIn of GitHub.',
  },
}

export default function PrivacyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [language, setLanguage] = useState<LegalLanguage>(function initializeLanguage() {
    const paramLanguage = readLanguage(searchParams)
    if (paramLanguage) return paramLanguage
    const storedLanguage = readStoredLanguage()
    if (storedLanguage) return storedLanguage
    return 'en'
  })

  useEffect(function syncLanguageWithUrl() {
    const paramLanguage = readLanguage(searchParams)
    if (paramLanguage && paramLanguage !== language) {
      setLanguage(paramLanguage)
      storeLanguage(paramLanguage)
      return
    }

    if (!paramLanguage) {
      const storedLanguage = readStoredLanguage()
      if (storedLanguage && storedLanguage !== language) {
        setLanguage(storedLanguage)
        updateLanguage(storedLanguage)
      } else if (storedLanguage) {
        updateLanguage(storedLanguage)
      }
    }
  }, [searchParams, language])

  const lastUpdated = useMemo(function deriveDate() {
    return new Date().toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [language])

  const copy = privacyCopy[language]

  return (
    <div className="space-y-6">
      <LegalHeader language={language} onLanguageChange={handleLanguageChange} />

      <header className="px-4 pt-2 md:px-5">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.updatedLabel}: {lastUpdated}
        </p>
      </header>

      <div className="space-y-4">
        <Section title={copy.introTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            {copy.intro.map(function (paragraph) {
              return (
                <p key={paragraph}>{paragraph}</p>
              )
            })}
          </div>
        </Section>

        <Section title={copy.infoTitle}>
          <div className="space-y-4 px-4 md:px-5">
            {copy.infoSections.map(function (info) {
              return (
                <SubSection key={info.title} title={info.title} icon={mapInfoIcon(info.title)}>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      {info.details.map(function (detail) {
                        return (
                          <li key={detail}>{detail}</li>
                        )
                      })}
                    </ul>
                    {info.note ? (
                      <p className="text-xs text-foreground">{info.note}</p>
                    ) : null}
                  </div>
                </SubSection>
              )
            })}
          </div>
        </Section>

        <Section title={copy.usageTitle}>
          <div className="space-y-3 px-4 md:px-5">
            {copy.usageItems.map(function (item, index) {
              return (
                <TimelineItem
                  key={item.title}
                  title={item.title}
                  icon={mapUsageIcon(index)}
                  indicator={item.indicator}
                >
                  {item.detail}
                </TimelineItem>
              )
            })}
          </div>
        </Section>

        <Section title={copy.storageTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.storageLead}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {copy.storageItems.map(function (item) {
                return (
                  <li key={item}>{item}</li>
                )
              })}
            </ul>
            <p>{copy.storageNote}</p>
          </div>
        </Section>

        <Section title={copy.cookiesTitle}>
          <div className="space-y-4 px-4 md:px-5">
            {copy.cookies.map(function (cookieSection) {
              return (
                <SubSection key={cookieSection.title} title={cookieSection.title} icon={Cookie}>
                  <div className="text-sm text-muted-foreground">
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      {cookieSection.items.map(function (item) {
                        return (
                          <li key={item}>{item}</li>
                        )
                      })}
                    </ul>
                  </div>
                </SubSection>
              )
            })}
          </div>
        </Section>

        <Section title={copy.rightsTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.rightsIntro}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {copy.rightsItems.map(function (item) {
                return (
                  <li key={item}>{item}</li>
                )
              })}
            </ul>
            <p className="font-mono text-xs">
              stoetenremco [dot] rs [at] gmail [dot] com
            </p>
          </div>
        </Section>

        <Section title={copy.partnersTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.partnersIntro}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {copy.partnersItems.map(function (item) {
                return (
                  <li key={item}>{item}</li>
                )
              })}
            </ul>
          </div>
        </Section>

        <Section title={copy.contactTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.contactIntro}</p>
            <p>{copy.contactNote}</p>
            <p className="font-mono text-xs">
              stoetenremco [dot] rs [at] gmail [dot] com
            </p>
          </div>
        </Section>
      </div>
    </div>
  )

  function handleLanguageChange(nextLanguage: LegalLanguage) {
    setLanguage(nextLanguage)
    storeLanguage(nextLanguage)
    updateLanguage(nextLanguage)
  }

  function updateLanguage(nextLanguage: LegalLanguage) {
    const href = buildLanguageHref(pathname, searchParams, nextLanguage)
    router.replace(href, { scroll: false })
  }
}

function mapInfoIcon(title: string) {
  if (title.toLowerCase().includes('analytics')) return Eye
  if (title.toLowerCase().includes('auth')) return Users
  if (title.toLowerCase().includes('contact')) return Mail
  return Database
}

function mapUsageIcon(index: number) {
  if (index === 0) return Eye
  if (index === 1) return Users
  if (index === 2) return Mail
  return Shield
}

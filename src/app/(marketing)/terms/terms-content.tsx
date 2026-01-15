'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, FileText, Github, Shield } from 'lucide-react'
import { Section, SubSection, TimelineItem } from '@/components/ui/section'
import { LegalHeader } from '../legal/legal-header'
import { LegalLanguage } from '../legal/legal-language'
import { readLanguage, readStoredLanguage, storeLanguage } from '../legal/language-utils'

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
  personality: string
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

const termsCopy: Record<LegalLanguage, TermsCopy> = {
  en: {
    title: 'Terms of Service',
    overviewTitle: 'Overview',
    canDoTitle: 'What You Can Do',
    avoidTitle: 'What You Should Avoid',
    contentTitle: 'Content and Intellectual Property',
    fairUseTitle: 'Fair Use',
    authTitle: 'GitHub Authentication',
    privacyTitle: 'Privacy and Data',
    disclaimerTitle: 'Disclaimers',
    accuracyTitle: 'Content Accuracy',
    adviceTitle: 'No Professional Advice',
    availabilityTitle: 'Service Availability',
    liabilityTitle: 'Limitation of Liability',
    changesTitle: 'Changes to Terms',
    contactTitle: 'Contact',
    updatedLabel: 'Last updated',
    overview: [
      'Welcome to remcostoeten.nl. These Terms of Service govern your use of my personal website and blog. By accessing or using this site, you agree to these terms.',
      'This is a personal portfolio and blog. I am not a company—just a developer sharing work and thoughts.',
    ],
    personality: 'Friendly, direct, and transparent',
    license: 'Unless a page states otherwise, the content and code samples published here are MIT licensed. You can copy, reuse, or remix them as long as you keep the license and attribution intact.',
    canDo: [
      { title: 'Read and share content', body: 'Feel free to read, share, and discuss posts. Linking is appreciated.' },
      { title: 'Reuse code', body: 'Code snippets and examples are MIT licensed unless a specific file says otherwise.' },
      { title: 'Interact', body: 'Leave thoughtful comments and reactions on blog posts using GitHub authentication.' },
      { title: 'Contact', body: 'Reach out with questions, collaboration opportunities, or feedback.' },
    ],
    cannotDo: [
      { title: 'Remove attribution', body: 'Do not strip the MIT license or misrepresent authorship of code or articles.' },
      { title: 'Abuse the platform', body: 'No spamming, harassment, or inappropriate behavior in comments or contact forms.' },
      { title: 'Automated scraping without care', body: 'Use scrapers responsibly. Hammering the site or bypassing protections is not allowed.' },
      { title: 'Security bypass', body: 'Do not attempt to circumvent security controls or reverse engineer private features.' },
    ],
    myContent: {
      heading: 'My Content',
      summary: [
        'Blog posts, tutorials, and original content are my intellectual property. Unless noted, they are MIT licensed for you to reuse with attribution.',
        'When reusing, keep the license intact and credit remcostoeten.nl.',
      ],
    },
    userContent: {
      heading: 'User Content',
      summary: [
        'When you leave comments or reactions you retain ownership, but you allow me to display them on this site.',
        'You are responsible for what you post.',
      ],
    },
    fairUse: 'Limited quoting and sharing for educational, commentary, or criticism purposes is welcome under fair use principles, provided proper attribution is given.',
    authIntro: 'This site uses GitHub OAuth for authentication. By signing in:',
    authBullets: [
      { label: 'You connect your GitHub account to this site.' },
      { label: 'Your public profile information is displayed with your comments.' },
      { label: 'You agree to GitHub’s Terms of Service.' },
      { label: 'You can revoke access anytime from your GitHub settings.' },
    ],
    authNote: 'I only access the minimum information needed for authentication and personalization.',
    privacyIntro: 'Your privacy matters. My Privacy Policy explains:',
    privacyBullets: [
      { label: 'What data I collect and why.' },
      { label: 'How I use and protect your information.' },
      { label: 'Your rights regarding your data.' },
    ],
    privacyNote: 'Using this site means you consent to the data collection practices described in the Privacy Policy.',
    accuracy: 'I do my best to provide accurate information, but content may contain errors or become outdated. Technical tutorials might not work in all environments. Use at your own risk.',
    advice: 'This is a personal blog, not professional advice. Content reflects my personal opinions and experiences, not professional guidance.',
    availability: 'This is a personal website, not a commercial service. I try to keep it running smoothly, but:',
    availabilityBullets: [
      { label: 'No uptime guarantees or service level agreements.' },
      { label: 'Temporary downtime for maintenance may occur.' },
      { label: 'Features may change or be removed without notice.' },
    ],
    availabilityNote: 'This service is provided “as is” without warranties.',
    liabilityIntro: 'To the fullest extent permitted by law:',
    liabilityBullets: [
      { label: 'I am not liable for damages arising from site use.' },
      { label: 'I am not responsible for third-party content or links.' },
      { label: 'I am not liable for code issues in tutorials.' },
    ],
    liabilityNote: 'This is a personal project—use it responsibly and at your own risk.',
    changes: [
      'I may update these Terms occasionally. Changes are effective immediately upon posting. Continued use of the site means you accept the updated terms.',
      'Major changes will be announced in a blog post or site notice.',
    ],
    contact: 'You can reach out via mail. I will try to reply but cannot guarantee a response. Other channels are LinkedIn or GitHub.',
  },
  nl: {
    title: 'Gebruiksvoorwaarden',
    overviewTitle: 'Overzicht',
    canDoTitle: 'Wat je mag doen',
    avoidTitle: 'Wat je beter vermijdt',
    contentTitle: 'Content en intellectueel eigendom',
    fairUseTitle: 'Fair use',
    authTitle: 'GitHub-authenticatie',
    privacyTitle: 'Privacy en data',
    disclaimerTitle: 'Disclaimers',
    accuracyTitle: 'Nauwkeurigheid',
    adviceTitle: 'Geen professioneel advies',
    availabilityTitle: 'Beschikbaarheid',
    liabilityTitle: 'Aansprakelijkheid',
    changesTitle: 'Wijzigingen in de voorwaarden',
    contactTitle: 'Contact',
    updatedLabel: 'Laatst bijgewerkt',
    overview: [
      'Welkom op remcostoeten.nl. Deze gebruiksvoorwaarden zijn van toepassing op mijn persoonlijke website en blog. Door de site te gebruiken ga je hiermee akkoord.',
      'Dit is een persoonlijk portfolio en blog. Ik ben geen bedrijf—alleen een ontwikkelaar die werk en ideeën deelt.',
    ],
    personality: 'Vriendelijk, direct en transparant',
    license: 'Tenzij anders vermeld zijn de inhoud en codevoorbeelden hier MIT-gelicentieerd. Je mag ze kopiëren, hergebruiken of aanpassen zolang je de licentie en naamsvermelding behoudt.',
    canDo: [
      { title: 'Lezen en delen', body: 'Lees, deel en bespreek gerust berichten. Een linkje wordt gewaardeerd.' },
      { title: 'Code hergebruiken', body: 'Codefragmenten en voorbeelden zijn MIT-gelicentieerd tenzij een bestand anders aangeeft.' },
      { title: 'Reageren', body: 'Laat doordachte reacties en reacties achter via GitHub-authenticatie.' },
      { title: 'Contact opnemen', body: 'Neem contact op met vragen, samenwerkingen of feedback.' },
    ],
    cannotDo: [
      { title: 'Naamsvermelding verwijderen', body: 'Verwijder de MIT-licentie niet en doe geen verkeerde voorstelling van auteurschap.' },
      { title: 'Misbruik van het platform', body: 'Geen spam, intimidatie of ongepast gedrag in reacties of contactformulieren.' },
      { title: 'Onzorgvuldig scrapen', body: 'Gebruik scrapers verantwoord. De site overbelasten of beveiliging omzeilen mag niet.' },
      { title: 'Beveiliging omzeilen', body: 'Probeer geen beveiligingsmaatregelen te omzeilen of privéfuncties te reverse-engineeren.' },
    ],
    myContent: {
      heading: 'Mijn content',
      summary: [
        'Blogposts, tutorials en originele content zijn mijn intellectuele eigendom. Tenzij anders vermeld zijn ze MIT-gelicentieerd zodat je ze met naamsvermelding kunt hergebruiken.',
        'Bij hergebruik: behoud de licentie en vermeld remcostoeten.nl als bron.',
      ],
    },
    userContent: {
      heading: 'Gebruikerscontent',
      summary: [
        'Wanneer je reacties of waarderingen achterlaat blijf jij eigenaar, maar geef je toestemming om ze op deze site te tonen.',
        'Je bent zelf verantwoordelijk voor wat je plaatst.',
      ],
    },
    fairUse: 'Beperkte citaten en delen voor educatieve doeleinden, commentaar of kritiek zijn welkom binnen de regels van fair use, mits met juiste naamsvermelding.',
    authIntro: 'Deze site gebruikt GitHub OAuth voor authenticatie. Door in te loggen:',
    authBullets: [
      { label: 'Koppel je je GitHub-account aan deze site.' },
      { label: 'Worden je openbare profielgegevens getoond bij reacties.' },
      { label: 'Ga je akkoord met de GitHub Terms of Service.' },
      { label: 'Kun je toegang op elk moment intrekken via je GitHub-instellingen.' },
    ],
    authNote: 'Ik gebruik alleen de minimale gegevens die nodig zijn voor authenticatie en personalisatie.',
    privacyIntro: 'Je privacy is belangrijk. In de Privacyverklaring lees je:',
    privacyBullets: [
      { label: 'Welke gegevens ik verzamel en waarom.' },
      { label: 'Hoe ik je gegevens gebruik en beveilig.' },
      { label: 'Welke rechten je hebt over je gegevens.' },
    ],
    privacyNote: 'Door deze site te gebruiken ga je akkoord met de gegevensverwerking zoals beschreven in de Privacyverklaring.',
    accuracy: 'Ik doe mijn best om nauwkeurige informatie te bieden, maar inhoud kan fouten bevatten of verouderen. Technische tutorials werken mogelijk niet in elke omgeving. Gebruik is op eigen risico.',
    advice: 'Dit is een persoonlijk blog, geen professioneel advies. Inhoud weerspiegelt mijn eigen mening en ervaring.',
    availability: 'Dit is een persoonlijke website, geen commerciële dienst. Ik houd de site zo goed mogelijk draaiend, maar:',
    availabilityBullets: [
      { label: 'Er zijn geen uptime-garanties of service level agreements.' },
      { label: 'Tijdelijke downtime voor onderhoud kan voorkomen.' },
      { label: 'Functies kunnen zonder aankondiging veranderen of verdwijnen.' },
    ],
    availabilityNote: 'Deze dienst wordt “zoals hij is” aangeboden, zonder garanties.',
    liabilityIntro: 'Voor zover wettelijk toegestaan:',
    liabilityBullets: [
      { label: 'Ben ik niet aansprakelijk voor schade die voortkomt uit gebruik van de site.' },
      { label: 'Ben ik niet verantwoordelijk voor inhoud of links van derden.' },
      { label: 'Ben ik niet aansprakelijk voor codeproblemen in tutorials.' },
    ],
    liabilityNote: 'Dit is een persoonlijk project—gebruik het verantwoord en op eigen risico.',
    changes: [
      'Ik kan deze voorwaarden af en toe bijwerken. Wijzigingen zijn direct van kracht na publicatie. Door de site te blijven gebruiken accepteer je de bijgewerkte voorwaarden.',
      'Grote wijzigingen kondig ik aan in een blogpost of melding op de site.',
    ],
    contact: 'Je kunt per mail contact opnemen. Ik probeer te antwoorden maar kan geen reactie garanderen. Andere kanalen zijn LinkedIn of GitHub.',
  },
}

export default function TermsContent() {
  const searchParams = useSearchParams()
  const [language, setLanguage] = useState<LegalLanguage>('en')

  useEffect(() => {
    const langParam = searchParams.get('lang')
    if (langParam === 'nl') {
      setLanguage('nl')
    } else {
      setLanguage('en')
    }
  }, [searchParams])

  const lastUpdated = useMemo(function deriveDate() {
    return new Date().toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [language])

  const copy = termsCopy[language]

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
        storeLanguage(storedLanguage)
      } else if (storedLanguage) {
        storeLanguage(storedLanguage)
      }
    }
  }, [searchParams, language])



  return (
    <div className="space-y-6">
      <LegalHeader language={language} onLanguageChange={setLanguage} />

      <header className="px-4 pt-2 md:px-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {copy.personality}
        </p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.updatedLabel}: {lastUpdated}
        </p>
      </header>

      <div className="space-y-4">
        <Section title={copy.overviewTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            {copy.overview.map(function (paragraph) {
              return (
                <p key={paragraph}>
                  {paragraph}
                </p>
              )
            })}
            <p className="rounded-none border border-border/50 bg-muted/30 p-3 text-xs text-foreground">
              {copy.license}
            </p>
          </div>
        </Section>

        <Section title={copy.canDoTitle}>
          <div className="space-y-3 px-4 md:px-5">
            {copy.canDo.map(function (item) {
              return (
                <TimelineItem
                  key={item.title}
                  title={item.title}
                  icon={FileText}
                  indicator="✓"
                >
                  {item.body}
                </TimelineItem>
              )
            })}
          </div>
        </Section>

        <Section title={copy.avoidTitle}>
          <div className="space-y-3 px-4 md:px-5">
            {copy.cannotDo.map(function (item, index) {
              return (
                <TimelineItem
                  key={`${item.title}-${index}`}
                  title={item.title}
                  icon={index === 0 ? Github : index === 1 ? AlertTriangle : Shield}
                  indicator="✗"
                >
                  {item.body}
                </TimelineItem>
              )
            })}
          </div>
        </Section>

        <Section title={copy.contentTitle}>
          <div className="space-y-4 px-4 md:px-5">
            <SubSection title={copy.myContent.heading}>
              <div className="space-y-2 text-sm text-muted-foreground">
                {copy.myContent.summary.map(function (paragraph) {
                  return (
                    <p key={paragraph}>
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </SubSection>

            <SubSection title={copy.userContent.heading}>
              <div className="space-y-2 text-sm text-muted-foreground">
                {copy.userContent.summary.map(function (paragraph) {
                  return (
                    <p key={paragraph}>
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </SubSection>

            <SubSection title={copy.fairUseTitle}>
              <div className="text-sm text-muted-foreground">
                <p>{copy.fairUse}</p>
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title={copy.authTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.authIntro}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {copy.authBullets.map(function (item) {
                return (
                  <li key={item.label}>{item.label}</li>
                )
              })}
            </ul>
            <p>{copy.authNote}</p>
          </div>
        </Section>

        <Section title={copy.privacyTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.privacyIntro}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {copy.privacyBullets.map(function (item) {
                return (
                  <li key={item.label}>{item.label}</li>
                )
              })}
            </ul>
            <p>{copy.privacyNote}</p>
          </div>
        </Section>

        <Section title={copy.disclaimerTitle}>
          <div className="space-y-4 px-4 md:px-5">
            <SubSection title={copy.accuracyTitle} icon={AlertTriangle}>
              <div className="text-sm text-muted-foreground">
                <p>{copy.accuracy}</p>
              </div>
            </SubSection>

            <SubSection title={copy.adviceTitle} icon={Shield}>
              <div className="text-sm text-muted-foreground">
                <p>{copy.advice}</p>
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title={copy.availabilityTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.availability}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {copy.availabilityBullets.map(function (item) {
                return (
                  <li key={item.label}>{item.label}</li>
                )
              })}
            </ul>
            <p>{copy.availabilityNote}</p>
          </div>
        </Section>

        <Section title={copy.liabilityTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.liabilityIntro}</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              {copy.liabilityBullets.map(function (item) {
                return (
                  <li key={item.label}>{item.label}</li>
                )
              })}
            </ul>
            <p className="text-xs">{copy.liabilityNote}</p>
          </div>
        </Section>

        <Section title={copy.changesTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            {copy.changes.map(function (paragraph) {
              return (
                <p key={paragraph}>{paragraph}</p>
              )
            })}
          </div>
        </Section>

        <Section title={copy.contactTitle}>
          <div className="space-y-4 px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
            <p>{copy.contact}</p>
            <p className="font-mono text-xs">
              stoetenremco [dot] rs [at] gmail [dot] com
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}

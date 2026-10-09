import { cacheLife, cacheTag } from 'next/cache'

export type DeveloperPackage = {
	slug: string
	name: string
	packageName: string
	tagline: string
	description: string
	whyHeading: string
	demoUrl?: string
	apiIntro?: string
	apiDetails?: {
		name: string
		signature: string
		arguments: { name: string; description: string }[]
	}[]
	keywords: string[]
	npmUrl?: string
	registryUrl?: string
	docsUrl?: string
	sourceUrl?: string
	install: string
	quickStart: string
	quickStartFile: string
	whenToUse: string
	highlights: string[]
	api: { name: string; description: string }[]
	apiExamples: {
		title: string
		description: string
		code: string
		fileName: string
	}[]
}

export const developerPackages: readonly DeveloperPackage[] = [
	{
		slug: 'analytics',
		name: 'Spoar',
		packageName: '@spoar/sdk',
		tagline: 'Privacy-first analytics you host yourself.',
		description:
			'Typed, cookie-free analytics for the browser, server and React, sent to your own Postgres.',
		whyHeading:
			'Know what people do without handing their data to a third party.',
		keywords: [
			'Spoar',
			'React analytics',
			'privacy analytics',
			'self-hosted analytics',
			'GDPR',
			'Next.js',
			'TypeScript'
		],
		npmUrl: 'https://www.npmjs.com/package/@spoar/sdk',
		docsUrl: 'https://docs.analytics.remcostoeten.nl',
		sourceUrl: 'https://github.com/remcostoeten/analytics',
		install: 'npm install @spoar/sdk@next',
		quickStartFile: 'analytics.ts',
		quickStart: `import { createAnalytics } from '@spoar/sdk'
import { errors, speedInsights } from '@spoar/sdk/plugins'
import type { Events } from './events'

export const analytics = createAnalytics<Events>({
  project: 'my-site',
  key: 'pk_live_...',
  endpoint: '/_ra',
  plugins: [speedInsights(), errors()]
})

analytics.track('signup', { plan: 'pro' })`,
		whenToUse:
			'Use it when you want product analytics on a site or app but do not want cookies, consent banners or a vendor in the loop. Create one client, list your events once, and add plugins only for what you need.',
		highlights: [
			'Events are typed per name, so track calls and their props autocomplete and fail to compile when they drift.',
			'Cookie-free, honours Do Not Track and Global Privacy Control, and batches sends with retries and sendBeacon on page hide.',
			'Plugins for web vitals, errors, scroll depth, clicks, forms and experiments, each under a kilobyte, so an app only ships what it uses.'
		],
		api: [
			{
				name: 'createAnalytics()',
				description:
					'Creates the browser client with project, key, endpoint and plugins.'
			},
			{
				name: 'analytics.track()',
				description: 'Sends a typed custom event with its props.'
			},
			{
				name: 'createServerAnalytics()',
				description:
					'Sends events from API routes, webhooks or cron jobs with a secret.'
			},
			{
				name: 'createProxy()',
				description:
					'Serves a same-origin endpoint so events get past ad blockers.'
			}
		],
		apiExamples: [
			{
				title: 'Mount it in Next',
				description:
					'The Next component sends each pageview with its route template, such as /blog/[slug].',
				fileName: 'app/layout.tsx',
				code: `import { AnalyticsProvider } from '@spoar/sdk/react'
import { Analytics } from '@spoar/sdk/next'
import { analytics } from './analytics'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider client={analytics}>
          <Analytics />
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  )
}`
			},
			{
				title: 'Track a signup on the server',
				description:
					'Record events that happen on the backend and never reach the browser.',
				fileName: 'app/api/signup/route.ts',
				code: `import { createServerAnalytics } from '@spoar/sdk/server'

const serverAnalytics = createServerAnalytics<Events>({
  secret: process.env.RA_SECRET,
  endpoint: 'https://api.analytics.remcostoeten.nl'
})

export async function POST(request: Request) {
  await createUser()
  await serverAnalytics.track('signup', { plan: 'pro' }, { request })
  return Response.json({ ok: true })
}`
			}
		]
	},
	{
		slug: 'auth-drawer',
		name: 'Auth Drawer',
		packageName: '@remcostoeten/auth-drawer',
		tagline: 'Authentication UI, ready to adapt.',
		description:
			'A configurable React authentication drawer and modal. Bring your own auth backend; keep the OAuth flows, forms, states, and polished presentation in one reusable UI primitive.',
		whyHeading: 'The auth UI is usually the part every app rebuilds.',
		demoUrl: 'https://auth-drawer.remcostoeten.nl/',
		apiIntro:
			'AuthDrawer renders the surface, useAuth opens it and reads session state, and the adapter connects those calls to your existing auth client. Your auth client still owns credentials, sessions, and requests. The whole surface is typed: config keys, provider names, adapter methods, and error codes autocomplete in the editor, so most integrations never need the docs open.',
		apiDetails: [
			{
				name: 'AuthDrawer',
				signature: '<AuthDrawer adapter={adapter} config={config} />',
				arguments: [
					{
						name: 'adapter',
						description:
							'Required. Maps your auth client to the drawer API.'
					},
					{
						name: 'config',
						description:
							'Optional. A typed AuthConfig merged over defaults. Controls copy, OAuth providers, layout, visual styling, and motion.'
					},
					{
						name: 'hideTrigger',
						description:
							'Optional. Hide the built-in trigger when your app opens the drawer itself.'
					}
				]
			},
			{
				name: 'AuthProvider',
				signature:
					'<AuthProvider adapter={adapter}>{children}</AuthProvider>',
				arguments: [
					{
						name: 'adapter',
						description:
							'Required. Shares the adapter and session state with nested components.'
					},
					{
						name: 'children',
						description:
							'The part of the app that can call useAuth().'
					}
				]
			},
			{
				name: 'useAuth()',
				signature: 'const { open, close, user } = useAuth()',
				arguments: [
					{
						name: 'open(mode?)',
						description:
							'Open the drawer, optionally on the sign-in or register view.'
					},
					{
						name: 'close()',
						description:
							'Close the drawer from an app-owned action.'
					},
					{
						name: 'user',
						description:
							'Read the current session user exposed by the adapter.'
					}
				]
			}
		],
		keywords: [
			'React authentication',
			'auth drawer',
			'OAuth UI',
			'TypeScript'
		],
		npmUrl: 'https://www.npmjs.com/package/@remcostoeten/auth-drawer',
		docsUrl: 'https://auth-drawer.remcostoeten.nl/docs?view=docs',
		sourceUrl: 'https://github.com/remcostoeten/auth-drawer',
		install: 'npm install @remcostoeten/auth-drawer',
		quickStartFile: 'app/auth.tsx',
		quickStart: `import { AuthDrawer, AuthProvider } from '@remcostoeten/auth-drawer'
import { createBetterAuthAdapter } from '@remcostoeten/auth-drawer/adapters/better-auth'

const adapter = createBetterAuthAdapter({ client })

export function Auth() {
  return (
    <AuthProvider adapter={adapter}>
      <AuthDrawer adapter={adapter} />
    </AuthProvider>
  )
}`,
		whenToUse:
			'Use Auth Drawer when authentication is already handled by a provider or API, but the product still needs a cohesive sign-in surface. It keeps this high-friction, highly repeated UI out of every individual app.',
		highlights: [
			'Provider-agnostic adapter boundary for Better Auth, Supabase, Auth.js, Clerk, Firebase, Passport, and custom JWT or REST APIs.',
			'Drawer and modal presentation with responsive mobile behavior, focus management, overlays, and configurable motion.',
			'Email/password, registration, password reset, OAuth providers, session hooks, and controlled trigger APIs.',
			'Typed end to end: the AuthConfig and AuthAdapter contracts drive autocomplete for every config key, provider name, and error code.'
		],
		api: [
			{
				name: 'AuthProvider',
				description:
					'Shares adapter and session state through app tree.'
			},
			{
				name: 'AuthDrawer',
				description:
					'Renders sign-in, sign-up, OAuth, and recovery flows.'
			},
			{
				name: 'useAuth()',
				description:
					'Reads user state and exposes sign-out plus drawer controls.'
			}
		],
		apiExamples: [
			{
				title: '1. Mount the surface',
				description:
					'Start with the provider and drawer near your app root.',
				fileName: 'app/auth.tsx',
				code: `import { AuthDrawer } from '@remcostoeten/auth-drawer'

export function Auth() {
  return <AuthDrawer adapter={adapter} />
}`
			},
			{
				title: '2. Add the provider',
				description:
					'Pass the adapter once when the drawer needs shared auth state.',
				fileName: 'app/auth.tsx',
				code: `import { AuthDrawer, AuthProvider } from '@remcostoeten/auth-drawer'

export function Auth() {
  return (
    <AuthProvider adapter={adapter}>
      <AuthDrawer adapter={adapter} />
    </AuthProvider>
  )
}`
			},
			{
				title: '3. Open it from anywhere',
				description:
					'Use the hook when a button or protected action owns the trigger.',
				fileName: 'components/sign-in-button.tsx',
				code: `import { useAuth } from '@remcostoeten/auth-drawer'

export function SignInButton() {
  const { open } = useAuth()

  return <button onClick={() => open('sign-in')}>Sign in</button>
}`
			},
			{
				title: '4. Shape it with config',
				description:
					'One optional AuthConfig object, deep merged over sensible defaults. Set only what you change and let intellisense walk you through the rest: ui.auth for providers and form flags, ui.presentation for drawer or modal, ui.copy for every string.',
				fileName: 'app/auth.tsx',
				code: `<AuthDrawer
  adapter={adapter}
  config={{
    ui: {
      auth: {
        providers: ['github', 'google'],
        allowRegister: true,
        emailAutocomplete: { domains: ['company.com'] }
      },
      presentation: { variant: 'modal' }
    }
  }}
/>`
			},
			{
				title: '5. Bring your own backend',
				description:
					'An adapter is a plain object mapping your auth API to the AuthResult shape. Only signIn is required with the createAdapter helper: the drawer feature-detects signUp, OAuth, and reset methods and renders only the flows you implement. Typed error codes like rate_limited and invalid_credentials pick the right message and retry behavior.',
				fileName: 'lib/auth-adapter.ts',
				code: `import { createAdapter } from '@remcostoeten/auth-drawer'

export const adapter = createAdapter({
  id: 'my-api',
  async signIn({ email, password }) {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      const rateLimited = res.status === 429

      return {
        success: false,
        error: {
          code: rateLimited ? 'rate_limited' : 'invalid_credentials',
          target: 'form',
          message: rateLimited
            ? 'Too many attempts. Wait a moment and try again.'
            : 'Email or password is incorrect.'
        }
      }
    }

    return { success: true, data: await res.json() }
  }
})`
			}
		]
	},
	{
		slug: 'use-shortcut',
		name: 'use-shortcut',
		packageName: '@remcostoeten/use-shortcut',
		tagline: 'Typed keyboard shortcuts for React.',
		description:
			'A React hook for key combinations, sequences and scoped shortcuts, with cleanup and input handling built in.',
		whyHeading: 'Raw keydown listeners break once shortcuts need scope.',
		apiIntro:
			'useShortcutBinding covers a single shortcut. useShortcut returns a builder for modifiers, sequences and scopes. Every registration returns a handle you can unbind, disable or trigger.',
		keywords: [
			'React keyboard shortcuts',
			'hotkeys hook',
			'TypeScript',
			'React hook'
		],
		npmUrl: 'https://www.npmjs.com/package/@remcostoeten/use-shortcut',
		docsUrl: 'https://use-shortcuts.vercel.app/use-shortcut',
		sourceUrl: 'https://github.com/remcostoeten/use-shortcut',
		install: 'npm install @remcostoeten/use-shortcut',
		quickStartFile: 'components/command-menu.tsx',
		quickStart: `import { useShortcutBinding } from '@remcostoeten/use-shortcut/react'

export function CommandMenu() {
  useShortcutBinding('mod+k', openPalette, {
    description: 'Open command palette'
  })

  useShortcutBinding('escape', closePalette)
}`,
		whenToUse:
			'Use it for command palettes, editors, dialogs and other keyboard-driven UI where shortcuts depend on what is open or focused.',
		highlights: [
			'mod maps to Cmd on macOS and Ctrl elsewhere.',
			'Shortcuts skip text inputs by default, and except() skips modals, editable content or a custom check.',
			'Scopes, priorities and conflict warnings handle overlapping shortcuts.'
		],
		api: [
			{
				name: 'useShortcutBinding()',
				description: 'Binds one shortcut and unbinds it on unmount.'
			},
			{
				name: 'useShortcut()',
				description: 'Returns a chainable builder.'
			},
			{
				name: 'useShortcutMap()',
				description:
					'Registers a set of shortcuts from one config object.'
			}
		],
		apiExamples: [
			{
				title: 'Sequences',
				description: 'Press g, then d.',
				fileName: 'components/navigation.tsx',
				code: `useShortcutBinding('g then d', goToDashboard, {
  sequenceTimeout: 1000
})`
			},
			{
				title: 'Scopes',
				description:
					'A shortcut tied to a scope only fires while that scope is active.',
				fileName: 'components/editor.tsx',
				code: `const $ = useShortcut({ activeScopes: 'navigation' })

useEffect(() => {
  const save = $.in('editor').mod.key('s').on(saveFile)
  $.setScopes('editor')

  return () => save.unbind()
}, [$, saveFile])`
			},
			{
				title: 'Shortcut maps',
				description:
					'Useful when shortcuts come from settings or config.',
				fileName: 'components/shortcuts.tsx',
				code: `useShortcutMap({
  save: { keys: 'mod+s', handler: save },
  close: { keys: 'escape', handler: closeDialog },
  dashboard: { keys: 'g then d', handler: goToDashboard }
})`
			}
		],
		apiDetails: [
			{
				name: 'useShortcutBinding()',
				signature: 'useShortcutBinding(keys, handler, options?)',
				arguments: [
					{
						name: 'keys',
						description:
							"A combo such as 'mod+k', a sequence such as 'g then d', or an array of either."
					},
					{
						name: 'options.preventDefault',
						description:
							'Blocks the browser default. On by default.'
					},
					{
						name: 'options.description',
						description:
							'Label shown in debug output and shortcut lists.'
					}
				]
			},
			{
				name: 'useShortcut()',
				signature: 'const $ = useShortcut(options?)',
				arguments: [
					{
						name: 'options.activeScopes',
						description: 'Scopes active when the builder mounts.'
					},
					{
						name: 'options.ignoreInputs',
						description:
							'Skips shortcuts while typing in inputs. On by default.'
					},
					{
						name: 'options.disabled',
						description:
							'Turns every shortcut off without unmounting.'
					}
				]
			},
			{
				name: 'ShortcutResult',
				signature: "const result = $.mod.key('k').on(handler)",
				arguments: [
					{
						name: 'unbind()',
						description: 'Removes the shortcut.'
					},
					{
						name: 'enable() / disable()',
						description: 'Toggles it without removing it.'
					},
					{
						name: 'trigger()',
						description: 'Runs the handler from code.'
					}
				]
			}
		]
	},
	{
		slug: 'notifier',
		name: 'Notifier',
		packageName: '@remcostoeten/notifier',
		tagline: 'A small notification API for React.',
		description:
			'Show loading, success, error, and confirmation states without building a new feedback component for every action.',
		whyHeading: 'Show what happened without interrupting the flow.',
		keywords: [
			'React notifications',
			'toast library',
			'promise toast',
			'TypeScript'
		],
		npmUrl: 'https://www.npmjs.com/package/@remcostoeten/notifier',
		sourceUrl: 'https://github.com/remcostoeten/Notify',
		install: 'npm install @remcostoeten/notifier',
		quickStartFile: 'components/save-button.tsx',
		quickStart: `'use client'

import { Notifier, notify } from '@remcostoeten/notifier'
import '@remcostoeten/notifier/styles'

export function SaveButton() {
  return (
    <>
      <button onClick={() => notify.success('Settings saved')}>
        Save settings
      </button>
      <Notifier position="bottom-right" colorMode="auto" />
    </>
  )
}`,
		whenToUse:
			'Use it for saves, uploads, background work, and actions that need confirmation.',
		highlights: [
			'Update the same notification as async work moves from loading to success or error.',
			'Track a promise or wait for a confirmation with one call.',
			'Choose the position, duration, theme, radius, and dismissal behavior.'
		],
		api: [
			{
				name: '<Notifier />',
				description:
					'Renders notification region and presentation settings.'
			},
			{
				name: 'notify.promise()',
				description:
					'Maps a promise to loading, success, and error messages.'
			},
			{
				name: 'notify.confirm()',
				description:
					'Awaits a user decision before destructive work continues.'
			}
		],
		apiExamples: [
			{
				title: 'Track a save',
				description: 'Let the request decide which state appears next.',
				fileName: 'components/save-button.tsx',
				code: `notify.promise(saveSettings(), {
  loading: 'Saving settings…',
  success: 'Settings saved',
  error: 'Could not save settings'
})`
			}
		]
	},
	{
		slug: 'empty-states',
		name: 'Empty States',
		packageName: 'remcostoeten.nl/r/empty-state.json',
		tagline: 'Empty states with copy, actions and motion.',
		description:
			'One React EmptyState component and a set of illustrations for empty lists, searches, inboxes, uploads and offline screens. Styled with Tailwind v4 and themed through CSS variables.',
		whyHeading: 'Every list, search and inbox needs a first-run screen.',
		keywords: [
			'React empty state',
			'empty state component',
			'Tailwind v4',
			'TypeScript'
		],
		registryUrl: 'https://www.remcostoeten.nl/r/empty-state.json',
		install:
			'npx shadcn@latest add https://www.remcostoeten.nl/r/empty-state.json',
		quickStartFile: 'components/records-empty.tsx',
		quickStart: `import { EmptyState } from '@/components/empty-state/empty-state'
import { RecordIllustration } from '@/components/empty-state/illustrations'

export function RecordsEmpty() {
  return (
    <EmptyState
      title="Your record space is empty"
      description="Connect a source or upload a CSV."
      illustration={<RecordIllustration />}
      animated="rise"
      pointer="tilt"
      actions={[{ id: 'connect', label: 'Connect source', onClick: connect }]}
    />
  )
}`,
		whenToUse:
			'Use it for any screen that can have nothing to show yet: a new workspace, a search without results, a cleared inbox, a failed connection. Every state takes the same props, so they look and behave alike across the app.',
		highlights: [
			'One component for every empty state, with title, description, illustration, actions, a help link and guide cards.',
			'Optional entrance motion, looping illustrations and a tilt or parallax effect that follows the mouse, all off under reduced motion.',
			'Installed as source through the shadcn CLI, so the files are yours to edit. Light and dark come from CSS variables or a theme prop, with no stylesheet to maintain.'
		],
		api: [
			{
				name: '<EmptyState />',
				description:
					'Renders illustration, copy, actions, link and guides.'
			},
			{
				name: 'Illustrations',
				description:
					'Animated SVGs for records, search, inbox and more.'
			},
			{
				name: 'pointer',
				description:
					'Tilts or shifts the illustration toward the mouse.'
			}
		],
		apiExamples: [
			{
				title: 'Follow the mouse',
				description:
					'Add motion to the illustration without extra components.',
				fileName: 'components/search-empty.tsx',
				code: `<EmptyState
  title="No results found"
  illustration={<SearchIllustration />}
  loop
  pointer="parallax"
/>`
			}
		]
	}
]

type NpmPackage = {
	version: string
	description?: string
	license?: string
}

export async function getNpmPackage(
	packageName: string
): Promise<NpmPackage | null> {
	'use cache'
	cacheLife('hours')
	cacheTag(`npm:${packageName}`)

	try {
		const response = await fetch(
			`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`
		)

		if (!response.ok) return null
		return (await response.json()) as NpmPackage
	} catch {
		return null
	}
}

export function getDeveloperPackage(slug: string) {
	return developerPackages.find(pkg => pkg.slug === slug)
}

type NpmDownloads = {
	downloads: number
}

/**
 * @name getWeeklyDownloads
 * @description Fetches the npm download count for a package over the last
 * seven days. Returns null when the registry is unreachable.
 *
 * @example
 * const downloads = await getWeeklyDownloads('@remcostoeten/use-shortcut')
 */
export async function getWeeklyDownloads(
	packageName: string
): Promise<number | null> {
	'use cache'
	cacheLife('hours')
	cacheTag(`npm-downloads:${packageName}`)

	try {
		const response = await fetch(
			`https://api.npmjs.org/downloads/point/last-week/${packageName}`
		)

		if (!response.ok) return null
		const data = (await response.json()) as NpmDownloads
		return data.downloads
	} catch {
		return null
	}
}

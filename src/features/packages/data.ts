import { cacheLife, cacheTag } from 'next/cache'

export type DeveloperPackage = {
	slug: string
	name: string
	packageName: string
	tagline: string
	description: string
	seoTitle?: string
	seoDescription?: string
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
		install: 'npm install @spoar/sdk',
		quickStartFile: 'lib/analytics.ts',
		quickStart: `import { createAnalytics } from '@spoar/sdk'
import { errors, speedInsights } from '@spoar/sdk/plugins'
import type { Events } from './events'

export const analytics = createAnalytics<Events>({
  project: 'my-site',
  key: 'pk_live_...',
  endpoint: '/_ra',
  pageviews: false,
  plugins: [speedInsights(), errors()]
})

analytics.track('signup', { plan: 'pro' })`,
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
				name: '<Analytics />',
				description:
					'Sends App Router pageviews with route templates. debugConsole opens the debug console for project admins.'
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
					'The Next component sends each pageview with its route template, such as /blog/[slug]. With debugConsole set, project admins open the debug console with Ctrl+Shift+K, and visitors load nothing for it.',
				fileName: 'app/providers.tsx',
				code: `'use client'

import type { ReactNode } from 'react'
import { AnalyticsProvider } from '@spoar/sdk/react'
import { Analytics } from '@spoar/sdk/next'
import { analytics } from '@/lib/analytics'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AnalyticsProvider client={analytics}>
      <Analytics debugConsole />
      {children}
    </AnalyticsProvider>
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
		seoDescription:
			'A configurable React authentication drawer and modal. Bring your own auth backend and keep OAuth flows, forms and states in one UI.',
		description:
			'A configurable React authentication drawer and modal. Bring your own auth backend; keep the OAuth flows, forms, states, and polished presentation in one reusable UI primitive.',
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
		tagline: 'Composable toast notifications for React.',
		description:
			'Toasts built from slots: an icon or avatar, a title, a description, progress and actions. Open one with a single call, update it in place, or compose the parts for your own layout.',
		apiIntro:
			'notify opens a toast and returns its id. notify.update and notify.promise change that toast in place, so one job stays one element. For layouts the slots do not cover, notify.custom renders the Toast parts directly. There is no stylesheet to import; Notifier adds its own.',
		keywords: [
			'React notifications',
			'React toast',
			'toast library',
			'promise toast',
			'TypeScript'
		],
		npmUrl: 'https://www.npmjs.com/package/@remcostoeten/notifier',
		sourceUrl: 'https://github.com/remcostoeten/Notify',
		install: 'npm install @remcostoeten/notifier motion',
		quickStartFile: 'components/save-button.tsx',
		quickStart: `'use client'

import { Notifier, notify } from '@remcostoeten/notifier'

export function SaveButton() {
  return (
    <>
      <button onClick={() => notify.success('Settings saved')}>
        Save settings
      </button>
      <Notifier position="bottom-right" tone="auto" />
    </>
  )
}`,
		api: [
			{
				name: '<Notifier />',
				description:
					'Mounts once and sets position, tone, timing, stacking and theme tokens.'
			},
			{
				name: 'notify()',
				description:
					'Opens a toast from a title or an object of slots and returns its id.'
			},
			{
				name: 'notify.update()',
				description:
					'Merges a patch into an open toast, such as new progress or a new status.'
			},
			{
				name: 'notify.promise()',
				description:
					'Maps a promise to loading, success and error states in one toast.'
			},
			{
				name: 'notify.custom()',
				description: 'Renders your own layout from the Toast parts.'
			}
		],
		apiExamples: [
			{
				title: 'Track a save',
				description:
					'One toast moves from loading to success or error when the promise settles.',
				fileName: 'components/save-button.tsx',
				code: `await notify.promise(saveSettings(), {
  loading: 'Saving settings…',
  success: data => ({ title: 'Settings saved', description: data.name }),
  error: error => ({ title: 'Could not save', description: error.message })
})`
			},
			{
				title: 'Slots and actions',
				description:
					'Pass the slots as one object. Filled with the accent color is the primary button.',
				fileName: 'components/update-toast.tsx',
				code: `notify({
  tone: 'dark',
  icon: <Download />,
  title: 'A new update is available',
  meta: 'v4.2',
  description: 'Includes the new dashboard view.',
  actions: [
    { label: 'Skip', variant: 'outline', color: 'muted' },
    { label: 'Install now', variant: 'filled', color: 'accent', onClick: install }
  ]
})`
			},
			{
				title: 'Progress in place',
				description:
					'Keep the id and patch the same toast. At 100 it starts its timer and closes.',
				fileName: 'components/upload.tsx',
				code: `const id = notify({ title: 'Uploading', progress: 0 })

upload.on('progress', percent => notify.update(id, { progress: percent }))
upload.on('done', () => notify.update(id, { title: 'Uploaded', progress: 100 }))`
			},
			{
				title: 'Custom layout',
				description:
					'The Toast parts read tone and dismiss handling from the toast around them.',
				fileName: 'components/message-toast.tsx',
				code: `notify.custom(() => (
  <Toast>
    <Toast.Avatar src={sender.avatar} badge="online" />
    <Toast.Body>
      <Toast.Title meta="2 mins ago">{sender.name}</Toast.Title>
      <Toast.Description>{message.preview}</Toast.Description>
      <Toast.Actions>
        <Toast.Action variant="outline">Dismiss</Toast.Action>
        <Toast.Action variant="filled" color="accent" onClick={reply}>
          Reply
        </Toast.Action>
      </Toast.Actions>
    </Toast.Body>
    <Toast.Close />
  </Toast>
))`
			}
		],
		apiDetails: [
			{
				name: 'notify()',
				signature: 'const id = notify(title, input?)',
				arguments: [
					{
						name: 'input.status',
						description:
							"'success', 'error', 'warning', 'info' or 'loading'. Adds the matching icon."
					},
					{
						name: 'input.progress',
						description:
							'0 to 100, or null for indeterminate. Keeps the toast open until it reaches 100.'
					},
					{
						name: 'input.actions',
						description:
							'Buttons or links. Each closes the toast after onClick unless dismiss is false.'
					},
					{
						name: 'input.duration',
						description:
							'Milliseconds before it closes. 0 keeps it open.'
					},
					{
						name: 'input.id',
						description:
							'Reuse an id to replace that toast instead of opening another.'
					}
				]
			},
			{
				name: '<Notifier />',
				signature: '<Notifier position="bottom-right" tone="auto" />',
				arguments: [
					{
						name: 'tone',
						description:
							"'light', 'dark' or 'auto', which follows prefers-color-scheme."
					},
					{
						name: 'maxVisible',
						description:
							'Toasts per position. Loading and unfinished progress toasts are never replaced.'
					},
					{
						name: 'stack',
						description:
							'Overlaps toasts into a stack that expands on hover.'
					},
					{
						name: 'theme',
						description:
							'Font, radius, width and color tokens per tone, also settable as --ntf-* CSS variables.'
					},
					{
						name: 'layer',
						description:
							'Puts the stylesheet in a cascade layer so Tailwind v4 utilities can override it.'
					}
				]
			}
		]
	},
	{
		slug: 'empty-states',
		name: 'Empty States',
		packageName: 'remcostoeten.nl/r/empty-state.json',
		tagline: 'Empty states with copy, actions and motion.',
		seoTitle: 'React Empty State Component',
		seoDescription:
			'A copyable React empty state component with animated illustrations for empty lists, searches, inboxes and uploads. Tailwind v4, installed with shadcn.',
		description:
			'One React EmptyState component and a set of illustrations for empty lists, searches, inboxes, uploads and offline screens. Styled with Tailwind v4 and themed through CSS variables.',
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
		quickStart: `import { EmptyState } from '@/components/home/empty-state/empty-state'
import { RecordIllustration } from '@/components/home/empty-state/illustrations'

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
	},
	{
		slug: 'animated-icons',
		name: 'Animated Icons',
		packageName: 'remcostoeten.nl/r/animated-icons.json',
		tagline: 'Stroke icons whose parts move on hover.',
		seoTitle: 'Animated SVG Icons for React',
		seoDescription:
			'45 animated React SVG icons whose parts move on hover, focus or state change. Plain CSS keyframes, no animation library, installed with shadcn.',
		description:
			'45 React stroke icons where each part has its own CSS keyframes. They play on hover or focus of a trigger, on a loop, or from code when state changes. No animation library.',
		keywords: [
			'React animated icons',
			'animated SVG icons',
			'CSS keyframes',
			'TypeScript'
		],
		registryUrl: 'https://www.remcostoeten.nl/r/animated-icons.json',
		install:
			'npx shadcn@latest add https://www.remcostoeten.nl/r/animated-icons.json',
		quickStartFile: 'components/search-button.tsx',
		quickStart: `import { useEffect } from 'react'
import { AnimatedSearchIcon } from '@/components/animated-icons/icons/search'
import { installIconHover } from '@/components/animated-icons/icon-frame'

export function SearchButton() {
  useEffect(() => installIconHover(), [])

  return (
    <button type="button" data-icon-trigger>
      <AnimatedSearchIcon size={20} />
      Search
    </button>
  )
}`,
		api: [
			{
				name: '<Animated*Icon />',
				description: 'An SVG icon with size and stroke props.'
			},
			{
				name: 'installIconHover()',
				description: 'Plays icons on hover and focus of a trigger.'
			},
			{
				name: 'playIcon(svg)',
				description: 'Plays an icon from code, for state changes.'
			}
		],
		apiExamples: []
	}
]

export type NpmPackage = {
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

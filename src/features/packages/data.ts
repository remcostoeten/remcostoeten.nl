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
	npmUrl: string
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
		tagline: 'Keyboard shortcuts without the ceremony.',
		description:
			'A typed React shortcut builder for key combinations, sequences, scopes, recording, and debug hooks, without scattering keyboard listeners through every component.',
		whyHeading: 'Keyboard listeners get messy once shortcuts have scope.',
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
		quickStart: `import { useShortcut } from '@remcostoeten/use-shortcut/react'

export function CommandMenu() {
  const $ = useShortcut()

  $.mod.key('k').on(() => openPalette(), {
    preventDefault: true
  })

  $.key('escape').on(() => closePalette())
}`,
		whenToUse:
			'Use it when shortcuts are part of product behavior, not a one-off event listener: command palettes, editors, complex dialogs, data-heavy interfaces, and apps with keyboard-first flows.',
		highlights: [
			'Fluent builder for combinations, pre-bound strings, sequences, modifiers, priorities, and conflict checks.',
			'Scopes, guards, and input handling let shortcuts behave correctly in layered application UI.',
			'Typed maps, recording mode, structured debug events, and attempt inspection support larger shortcut systems.'
		],
		api: [
			{
				name: 'useShortcut()',
				description: 'Returns chainable shortcut builder.'
			},
			{
				name: '$.bind()',
				description:
					'Registers a shortcut from a string or config value.'
			},
			{
				name: '$.key().then()',
				description: 'Builds ordered keyboard sequences.'
			}
		],
		apiExamples: [
			{
				title: '1. Bind one key',
				description:
					'Start with one shortcut next to the feature it controls.',
				fileName: 'components/command-menu.tsx',
				code: `const $ = useShortcut()

$.key('escape').on(() => closePalette())`
			},
			{
				title: '2. Add a modifier',
				description:
					'Build combinations without writing platform-specific listeners.',
				fileName: 'components/command-menu.tsx',
				code: `const $ = useShortcut()

$.mod.key('k').on(() => openPalette())`
			},
			{
				title: '3. Add scope and options',
				description:
					'Keep the shortcut local when the interface has multiple active layers.',
				fileName: 'components/command-menu.tsx',
				code: `$.mod.key('k').on(() => openPalette(), {
  scope: 'command-menu',
  preventDefault: true
})`
			}
		],
		apiDetails: [
			{
				name: 'useShortcut()',
				signature: 'const $ = useShortcut(options?)',
				arguments: [
					{
						name: 'options.scope',
						description:
							'Optional default scope for shortcuts created by this builder.'
					},
					{
						name: 'options.enabled',
						description:
							'Optional switch for disabling the builder without unmounting the component.'
					}
				]
			},
			{
				name: '$.key().on()',
				signature: "$.mod.key('k').on(handler, options?)",
				arguments: [
					{
						name: 'handler',
						description: 'Runs when the key combination matches.'
					},
					{
						name: 'options.preventDefault',
						description:
							'Prevent the browser’s default action for the matching key.'
					},
					{
						name: 'options.scope',
						description:
							'Limit the shortcut to an active scope such as command-menu or editor.'
					}
				]
			},
			{
				name: '$.key().then()',
				signature: "$.key('g').then('d').on(openDashboard)",
				arguments: [
					{
						name: 'then(key)',
						description:
							'Append the next key in an ordered sequence.'
					},
					{
						name: 'on(handler)',
						description:
							'Run the handler after the complete sequence matches.'
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

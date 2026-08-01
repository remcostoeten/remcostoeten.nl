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
	workflow: { title: string; description: string }[]
	api: { name: string; description: string }[]
	apiExamples: {
		title: string
		description: string
		code: string
		fileName: string
	}[]
	faqs: { question: string; answer: string }[]
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
		workflow: [
			{
				title: 'Connect adapter',
				description: 'Map existing auth client to typed adapter once.'
			},
			{
				title: 'Mount surface',
				description:
					'Place AuthProvider and AuthDrawer near application root.'
			},
			{
				title: 'Open anywhere',
				description:
					'Use hook or trigger API from navigation, paywalls, or protected actions.'
			}
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
		],
		faqs: [
			{
				question: 'Does it include an auth backend?',
				answer: 'No, deliberately. It is the sign-in surface plus a typed adapter over whatever already owns your sessions: Better Auth, Supabase, NextAuth, Clerk, Firebase, Passport, or your own JWT and REST endpoints. Your backend does not change; the drawer just stops you from rebuilding its UI in every app.'
			},
			{
				question: 'My auth provider is not in the adapter list. Am I stuck?',
				answer: 'No. Implement the exported AuthAdapter contract (signIn, signUp, signOut, useSession) and the drawer treats it like any first-party adapter. TypeScript checks your implementation against the contract, and the UI reveals registration, OAuth, and reset flows based on which methods you actually provide.'
			},
			{
				question: 'Do I need Tailwind or a separate stylesheet?',
				answer: 'Neither. Prebuilt styles ship with the component import, so there is no CSS file to remember and no Tailwind requirement in your app. Presentation, copy, provider buttons, and motion are all shaped through one deep-merged config object instead.'
			},
			{
				question: 'Does it work with the Next.js App Router?',
				answer: 'Yes. Mount AuthProvider and AuthDrawer in a small client shell near the root and add a portal div to your layout so the drawer renders above page content with scroll lock. Server components everywhere else stay server components.'
			},
			{
				question: 'Can I build the UI before the backend exists?',
				answer: 'Yes. Ship the bundled mock adapter, click through sign-in, registration, and reset with fake sessions, then swap in the real adapter later. Nothing in the UI layer changes.'
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
		workflow: [
			{
				title: 'Create builder',
				description: 'Call useShortcut once inside feature component.'
			},
			{
				title: 'Describe intent',
				description:
					'Bind combinations or sequences close to feature behavior.'
			},
			{
				title: 'Control scope',
				description:
					'Enable only where shortcut should own keyboard input.'
			}
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
		],
		faqs: [
			{
				question: 'Does mod work on Windows and macOS?',
				answer: 'Yes. The mod modifier maps to Cmd on macOS and Ctrl elsewhere.'
			},
			{
				question: 'Can shortcuts be scoped to an editor or modal?',
				answer: 'Yes. Use scopes and guards so only active UI owns a shortcut.'
			}
		]
	},
	{
		slug: 'notifier',
		name: 'Notifier',
		packageName: '@remcostoeten/notifier',
		tagline: 'Notifications with a fluent API.',
		description:
			'A lightweight, chainable React notification system for useful feedback: status changes, async work, confirmations, and errors that need a clear next state.',
		whyHeading: 'Feedback state should not become modal state.',
		keywords: [
			'React notifications',
			'toast library',
			'promise toast',
			'TypeScript'
		],
		npmUrl: 'https://www.npmjs.com/package/@remcostoeten/notifier',
		sourceUrl: 'https://github.com/remcostoeten/Notify',
		install: 'npm install @remcostoeten/notifier',
		quickStartFile: 'app/layout.tsx',
		quickStart: `import { Notifier, notify } from '@remcostoeten/notifier'

export function App() {
  return <Notifier position="bottom-right" />
}

const notice = notify.loading('Saving settings…')
saveSettings().then(() => notice.success('Settings saved'))`,
		whenToUse:
			'Use Notifier when a product action needs compact, visible feedback without turning every mutation into its own modal state machine. Especially useful for saves, imports, background work, and destructive confirmation.',
		highlights: [
			'Chain a single notice from loading to success or error as async work resolves.',
			'Track promises, ask async confirmation questions, dismiss individual notices, or clear a queue.',
			'Configure placement, duration, visible count, theme mode, radius, icons, hover pause, and swipe dismissal.'
		],
		workflow: [
			{
				title: 'Mount once',
				description: 'Render Notifier near app root.'
			},
			{
				title: 'Start feedback',
				description:
					'Create loading or informational notice at action boundary.'
			},
			{
				title: 'Resolve state',
				description:
					'Promote same notice to success or error after work completes.'
			}
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
				title: '1. Show a result',
				description:
					'Use a direct call when the next state is already known.',
				fileName: 'components/save-button.tsx',
				code: `notify.success('Settings saved')`
			},
			{
				title: '2. Show work in progress',
				description:
					'Keep one notice and promote it when the request finishes.',
				fileName: 'components/save-button.tsx',
				code: `const notice = notify.loading('Saving settings…')

saveSettings().then(() => notice.success('Settings saved'))`
			},
			{
				title: '3. Let the promise drive it',
				description:
					'Use the promise helper when loading, success, and error all follow the request.',
				fileName: 'components/save-button.tsx',
				code: `notify.promise(saveSettings(), {
  loading: 'Saving settings…',
  success: 'Settings saved',
  error: 'Could not save settings'
})`
			}
		],
		apiDetails: [
			{
				name: '<Notifier />',
				signature:
					'<Notifier position="bottom-right" options={options} />',
				arguments: [
					{
						name: 'position',
						description:
							'Where the notification region is mounted: top, bottom, left, or right variants.'
					},
					{
						name: 'options',
						description:
							'Optional defaults for duration, visible count, theme, radius, icons, and swipe behavior.'
					}
				]
			},
			{
				name: 'notify.promise()',
				signature: 'notify.promise(task, messages, options?)',
				arguments: [
					{
						name: 'task',
						description:
							'The promise that controls the notification lifecycle.'
					},
					{
						name: 'messages.loading',
						description: 'Text shown while the promise is pending.'
					},
					{
						name: 'messages.success / error',
						description:
							'Text shown when the promise resolves or rejects.'
					}
				]
			},
			{
				name: 'notify.confirm()',
				signature: 'await notify.confirm(options)',
				arguments: [
					{
						name: 'options.title',
						description: 'The confirmation heading.'
					},
					{
						name: 'options.description',
						description:
							'The context for the action the user is about to confirm.'
					},
					{
						name: 'options.confirmLabel',
						description: 'Optional label for the confirm action.'
					}
				]
			}
		],
		faqs: [
			{
				question: 'Can I use promise tracking?',
				answer: 'Yes. notify.promise() manages loading, success, and error states around async work.'
			},
			{
				question: 'Can notifications be themed?',
				answer: 'Yes. Set color mode, radius, icon treatment, position, duration, and swipe behavior on Notifier.'
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

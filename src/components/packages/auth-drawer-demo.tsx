'use client'

import { AuthDrawer, AuthProvider, useAuth } from '@remcostoeten/auth-drawer'
import { createMockAdapter } from '@remcostoeten/auth-drawer/adapters/mock'

const DEMO_EMAIL = 'demo@remcostoeten.nl'
const DEMO_PASSWORD = 'password'

const ERROR_COPY: Record<string, string> = {
	rate_limited: 'Too many attempts. Wait a moment and try again.',
	invalid_credentials: 'Email or password is incorrect.'
}

const mockAdapter = createMockAdapter({
	mockEmail: DEMO_EMAIL,
	mockPassword: DEMO_PASSWORD
})

// auth-drawer <= 0.3.2 renders adapter-returned errors verbatim with a generic
// message, so rate_limited and invalid_credentials look identical; remap until
// the fixed version ships.
const adapter: typeof mockAdapter = {
	...mockAdapter,
	async signIn(input) {
		const result = await mockAdapter.signIn(input)

		if (result.error) {
			return {
				...result,
				error: {
					...result.error,
					message:
						ERROR_COPY[result.error.code] ?? result.error.message
				}
			}
		}

		return result
	}
}

function DemoPanel() {
	const { user, isPending, openDrawer, signOut } = useAuth()

	return (
		<div className="border border-border bg-muted/20 p-4">
			<p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
				Live demo
			</p>
			<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
				The real drawer, running on this page against the mock adapter.
				Every flow works: sign in, register, OAuth, and password reset.
			</p>
			<div className="mt-4 flex flex-wrap items-center gap-3">
				{user ? (
					<>
						<span className="text-sm text-foreground">
							Signed in as{' '}
							<span className="font-mono text-xs">
								{user.email}
							</span>
						</span>
						<button
							type="button"
							onClick={() => signOut()}
							className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
						>
							Sign out
						</button>
					</>
				) : (
					<button
						type="button"
						onClick={() => openDrawer()}
						disabled={isPending}
						className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:opacity-50"
					>
						Open the auth drawer
					</button>
				)}
			</div>
			<dl className="mt-4 grid gap-1 font-mono text-[11px] text-muted-foreground">
				<div className="flex gap-2">
					<dt>email</dt>
					<dd className="text-foreground">{DEMO_EMAIL}</dd>
				</div>
				<div className="flex gap-2">
					<dt>password</dt>
					<dd className="text-foreground">{DEMO_PASSWORD}</dd>
				</div>
				<div className="flex gap-2">
					<dt>error state</dt>
					<dd>try spam@example.com to hit the rate limiter</dd>
				</div>
			</dl>
		</div>
	)
}

export function AuthDrawerDemo() {
	return (
		<AuthProvider adapter={adapter}>
			<DemoPanel />
			<AuthDrawer adapter={adapter} hideTrigger />
		</AuthProvider>
	)
}

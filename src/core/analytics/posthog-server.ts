import { PostHog } from 'posthog-node'

let client: PostHog | null = null

/**
 * Returns a shared server-side PostHog client, or `null` when no key is
 * configured. Uses immediate flushing so events are not lost in short-lived
 * serverless invocations.
 */
export function getPostHogServer(): PostHog | null {
	if (client) return client

	const key = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY
	if (!key) return null

	client = new PostHog(key, {
		host:
			process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
		flushAt: 1,
		flushInterval: 0
	})

	return client
}

/**
 * Captures a single server-side event and flushes immediately. Safe to call
 * when PostHog is unconfigured — it becomes a no-op.
 */
export async function captureServerEvent(
	distinctId: string,
	event: string,
	properties?: Record<string, unknown>
): Promise<void> {
	const ph = getPostHogServer()
	if (!ph) return

	ph.capture({ distinctId, event, properties })
	await ph.flush()
}

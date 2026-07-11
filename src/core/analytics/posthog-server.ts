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

type TCaptureOptions = {
	/**
	 * Create/update a person profile for this `distinctId`. Defaults to `false`,
	 * mirroring the client's `person_profiles: 'identified_only'` — anonymous
	 * events stay anonymous and don't bill as person-profile events.
	 */
	withPersonProfile?: boolean
	/** Person properties to write, updated on every capture. */
	setPersonProperties?: Record<string, unknown>
	/** Person properties written only if the person doesn't already have them. */
	setPersonPropertiesOnce?: Record<string, unknown>
}

/**
 * Captures a single server-side event and flushes immediately. Safe to call
 * when PostHog is unconfigured — it becomes a no-op.
 *
 * Anonymous by default: pass `withPersonProfile` (or any person properties) to
 * upgrade the event to an identified one.
 */
export async function captureServerEvent(
	distinctId: string,
	event: string,
	properties?: Record<string, unknown>,
	options: TCaptureOptions = {}
): Promise<void> {
	const ph = getPostHogServer()
	if (!ph) return

	const { withPersonProfile, setPersonProperties, setPersonPropertiesOnce } =
		options

	const identified =
		withPersonProfile === true ||
		setPersonProperties !== undefined ||
		setPersonPropertiesOnce !== undefined

	ph.capture({
		distinctId,
		event,
		properties: {
			...properties,
			...(identified ? {} : { $process_person_profile: false }),
			...(setPersonProperties ? { $set: setPersonProperties } : {}),
			...(setPersonPropertiesOnce
				? { $set_once: setPersonPropertiesOnce }
				: {})
		}
	})
	await ph.flush()
}

/**
 * Creates or updates a person profile without attaching an event. Safe to call
 * when PostHog is unconfigured — it becomes a no-op.
 */
export async function identifyServerPerson(
	distinctId: string,
	properties?: Record<string, unknown>,
	propertiesOnce?: Record<string, unknown>
): Promise<void> {
	const ph = getPostHogServer()
	if (!ph) return

	ph.identify({
		distinctId,
		properties: {
			...properties,
			...(propertiesOnce ? { $set_once: propertiesOnce } : {})
		}
	})
	await ph.flush()
}

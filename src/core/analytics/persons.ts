'use client'

import posthog from 'posthog-js'

/**
 * Client-side person-profile helpers. The SDK runs with
 * `person_profiles: 'identified_only'`, so a profile only comes into existence
 * once `identifyPerson` (or a person-property write) is called — everything
 * before that stays anonymous.
 *
 * @see https://posthog.com/docs/data/persons#capturing-person-profiles
 */

function ready(): boolean {
	return typeof window !== 'undefined' && posthog.__loaded === true
}

/**
 * Associates the current anonymous session with a stable id and creates the
 * person profile. Call once per login — it's a no-op on repeat calls with the
 * same id.
 *
 * @param distinctId Stable identifier for the person (never an anonymous id).
 * @param properties Person properties, overwritten on each identify.
 * @param propertiesOnce Person properties set only on first write.
 */
export function identifyPerson(
	distinctId: string,
	properties?: Record<string, unknown>,
	propertiesOnce?: Record<string, unknown>
): void {
	if (!ready()) return
	posthog.identify(distinctId, properties, propertiesOnce)
}

/** Updates properties on the already-identified person. */
export function setPersonProperties(
	properties?: Record<string, unknown>,
	propertiesOnce?: Record<string, unknown>
): void {
	if (!ready()) return
	posthog.setPersonProperties(properties, propertiesOnce)
}

/**
 * Clears the identified person and generates a fresh anonymous id. Call on
 * logout, otherwise the next visitor on the same device is merged into the
 * previous person.
 */
export function resetPerson(): void {
	if (!ready()) return
	posthog.reset()
}

import { useSyncExternalStore } from 'react'
import { noop } from '@/shared/lib/noop'

const STORAGE_KEY = 'session-hint'
const CHANGE_EVENT = 'session-hint-change'

function readSessionHint() {
	try {
		return localStorage.getItem(STORAGE_KEY) === '1'
	} catch {
		return false
	}
}

function subscribe(onChange: () => void) {
	window.addEventListener('storage', onChange)
	window.addEventListener(CHANGE_EVENT, onChange)

	return () => {
		window.removeEventListener('storage', onChange)
		window.removeEventListener(CHANGE_EVENT, onChange)
	}
}

/**
 * @name setSessionHint
 * @description Records in localStorage whether this browser probably holds a
 * session. The session cookie is HttpOnly, so this hint is the only signal the
 * client has to decide if asking the server for the session is worth a request.
 *
 * @example
 * setSessionHint(true)
 */
export function setSessionHint(hasSession: boolean) {
	try {
		if (hasSession) localStorage.setItem(STORAGE_KEY, '1')
		else localStorage.removeItem(STORAGE_KEY)
	} catch {
		noop()
	}

	window.dispatchEvent(new Event(CHANGE_EVENT))
}

/**
 * @name useSessionHint
 * @description Reads the session hint reactively. Always false on the server
 * and during hydration, so anonymous output matches the prerendered HTML.
 *
 * @example
 * const mayHaveSession = useSessionHint()
 */
export function useSessionHint() {
	return useSyncExternalStore(subscribe, readSessionHint, () => false)
}

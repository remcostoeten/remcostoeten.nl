// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setSessionHint, useSessionHint } from '@/features/auth/session-hint'

function Probe() {
	const mayHaveSession = useSessionHint()
	return <span>{mayHaveSession ? 'hinted' : 'anonymous'}</span>
}

describe('session hint', () => {
	let container: HTMLDivElement
	let root: Root

	beforeEach(() => {
		globalThis.IS_REACT_ACT_ENVIRONMENT = true
		localStorage.clear()
		container = document.createElement('div')
		document.body.appendChild(container)
		root = createRoot(container)
	})

	afterEach(() => {
		act(() => root.unmount())
		container.remove()
	})

	it('renders anonymous when no hint was stored', () => {
		act(() => root.render(<Probe />))

		expect(container.textContent).toBe('anonymous')
	})

	it('renders hinted when a hint was stored before mount', () => {
		setSessionHint(true)

		act(() => root.render(<Probe />))

		expect(container.textContent).toBe('hinted')
	})

	it('follows later changes to the hint', () => {
		act(() => root.render(<Probe />))

		act(() => setSessionHint(true))
		expect(container.textContent).toBe('hinted')

		act(() => setSessionHint(false))
		expect(container.textContent).toBe('anonymous')
		expect(localStorage.getItem('session-hint')).toBeNull()
	})
})

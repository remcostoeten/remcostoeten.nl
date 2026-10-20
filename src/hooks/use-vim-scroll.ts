'use client'

import { useEffect, useState } from 'react'
import { useShortcutMap } from '@remcostoeten/use-shortcut/react'

const TAP_DISTANCE = 80
const HOLD_SPEED = 1.2
const SMOOTHING = 60
const MAX_FRAME_GAP = 50

function createScroller() {
	let frame = 0
	let direction: 1 | -1 = 1
	let held = false
	let pending = 0
	let target = 0
	let position = 0
	let lastTime = 0

	function maxScroll() {
		return document.documentElement.scrollHeight - window.innerHeight
	}

	function tick(time: number) {
		const elapsed = Math.min(Math.max(time - lastTime, 0), MAX_FRAME_GAP)
		lastTime = time

		if (Math.abs(window.scrollY - position) > 2) {
			position = window.scrollY
			target = position
		}

		if (held || pending > 0) {
			const advance = HOLD_SPEED * elapsed
			target += direction * advance
			pending = Math.max(0, pending - advance)
		}

		target = Math.min(Math.max(target, 0), maxScroll())
		position += (target - position) * (1 - Math.exp(-elapsed / SMOOTHING))

		const settled =
			!held && pending === 0 && Math.abs(target - position) < 0.5
		if (settled) position = target

		window.scrollTo({ top: position, behavior: 'instant' })
		frame = settled ? 0 : requestAnimationFrame(tick)
	}

	function press(next: 1 | -1, repeat: boolean) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			window.scrollBy({ top: next * TAP_DISTANCE, behavior: 'instant' })
			return
		}

		if (repeat && held) return

		if (!frame) {
			position = window.scrollY
			target = position
			lastTime = performance.now()
			frame = requestAnimationFrame(tick)
		} else if (next !== direction) {
			pending = 0
			target = position
		}

		direction = next
		held = true
		pending += TAP_DISTANCE
	}

	function release(released: 1 | -1) {
		if (released === direction) held = false
	}

	function releaseAll() {
		held = false
	}

	function stop() {
		cancelAnimationFrame(frame)
		frame = 0
		held = false
		pending = 0
	}

	return { press, release, releaseAll, stop }
}

/**
 * @name useVimScroll
 * @description Scrolls the window with j and k. A tap moves a fixed
 * distance, holding the key scrolls continuously until it is released,
 * and every step is eased in one requestAnimationFrame loop.
 *
 * @example
 * function Shell() {
 *   useVimScroll()
 *   return <main />
 * }
 */
export function useVimScroll() {
	const [scroller] = useState(createScroller)

	useShortcutMap({
		scrollDown: {
			keys: 'j',
			handler: event => scroller.press(1, event.repeat),
			options: { description: 'Scroll down', except: ['typing', 'modal'] }
		},
		scrollUp: {
			keys: 'k',
			handler: event => scroller.press(-1, event.repeat),
			options: { description: 'Scroll up', except: ['typing', 'modal'] }
		}
	})

	useEffect(() => {
		function handleKeyUp(event: KeyboardEvent) {
			const key = event.key.toLowerCase()
			if (key === 'j') scroller.release(1)
			if (key === 'k') scroller.release(-1)
		}

		window.addEventListener('keyup', handleKeyUp)
		window.addEventListener('blur', scroller.releaseAll)
		return () => {
			window.removeEventListener('keyup', handleKeyUp)
			window.removeEventListener('blur', scroller.releaseAll)
			scroller.stop()
		}
	}, [scroller])
}

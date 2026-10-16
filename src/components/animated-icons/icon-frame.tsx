import './animated-icons.css'
import type { ReactNode, SVGProps } from 'react'

export type AnimatedIconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
	size?: number
}

type AnimatedIconFrameProps = AnimatedIconProps & {
	name: string
	children: ReactNode
}

export function dotPath(x: number, y: number) {
	return `M${x + 0.125} ${y}H${x}m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0`
}

export function AnimatedIconFrame({
	name,
	size = 16,
	className,
	children,
	...props
}: AnimatedIconFrameProps) {
	return (
		<svg
			className={
				className === undefined
					? 'animated-icon'
					: `animated-icon ${className}`
			}
			data-icon={name}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			{children}
		</svg>
	)
}

function noop() {}

/**
 * @name playIcon
 * @description Plays an animated icon's part animations from the start, for
 * state-driven feedback such as completing a task. Hover and focus play icons
 * through installIconHover without calling this.
 *
 * @example
 * const icon = button.querySelector<SVGSVGElement>('.animated-icon')
 * if (icon) playIcon(icon)
 */
export function playIcon(icon: SVGSVGElement) {
	icon.removeAttribute('data-play')
	icon.setAttribute('data-restart', '')
	// WORKAROUND: reading animations flushes styles so a hover-held animation restarts.
	icon.getAnimations({ subtree: true })
	icon.removeAttribute('data-restart')
	icon.setAttribute('data-play', '')
	const running = icon
		.getAnimations({ subtree: true })
		.map(animation => animation.finished)
	Promise.all(running).then(() => icon.removeAttribute('data-play'), noop)
}

type DelayGroup = {
	openDelay: (now?: number) => number
	show: (dismiss: () => void) => void
	hide: (dismiss: () => void, now?: number) => void
}

function createDelayGroup(coldDelay: number, warmWindow: number): DelayGroup {
	let current: (() => void) | null = null
	let isShown = false
	let hiddenAt = Number.NEGATIVE_INFINITY

	return {
		openDelay(now = performance.now()) {
			return isShown || now - hiddenAt < warmWindow ? 0 : coldDelay
		},
		show(dismiss) {
			if (current !== null && current !== dismiss) current()
			current = dismiss
			isShown = true
		},
		hide(dismiss, now = performance.now()) {
			if (current === dismiss && isShown) {
				isShown = false
				hiddenAt = now
			}
		}
	}
}

const hoverAttribute = 'data-icon-hover'
const iconGroup = createDelayGroup(200, 300)
const pending = new WeakMap<Element, number>()
const dismissers = new WeakMap<Element, () => void>()

function triggerOf(node: EventTarget | null) {
	if (!(node instanceof Element)) return null
	return node.closest('[data-icon-trigger]') ?? node.closest('.animated-icon')
}

function dismisserOf(trigger: Element) {
	const existing = dismissers.get(trigger)
	if (existing !== undefined) return existing
	function dismiss() {
		window.clearTimeout(pending.get(trigger))
		trigger.removeAttribute(hoverAttribute)
	}
	dismissers.set(trigger, dismiss)
	return dismiss
}

function reveal(trigger: Element) {
	iconGroup.show(dismisserOf(trigger))
	trigger.setAttribute(hoverAttribute, '')
}

function enter(trigger: Element) {
	window.clearTimeout(pending.get(trigger))
	const delay = iconGroup.openDelay()
	if (delay === 0) {
		reveal(trigger)
		return
	}
	pending.set(
		trigger,
		window.setTimeout(() => reveal(trigger), delay)
	)
}

function leave(trigger: Element) {
	const dismiss = dismisserOf(trigger)
	iconGroup.hide(dismiss)
	dismiss()
}

function listen(root: Document) {
	const controller = new AbortController()
	const { signal } = controller

	root.addEventListener(
		'pointerover',
		event => {
			const trigger = triggerOf(event.target)
			if (trigger !== null && trigger !== triggerOf(event.relatedTarget))
				enter(trigger)
		},
		{ signal }
	)
	root.addEventListener(
		'pointerout',
		event => {
			const trigger = triggerOf(event.target)
			if (trigger !== null && trigger !== triggerOf(event.relatedTarget))
				leave(trigger)
		},
		{ signal }
	)
	root.addEventListener(
		'focusin',
		event => {
			const trigger = triggerOf(event.target)
			if (trigger !== null && trigger.matches(':focus-visible'))
				enter(trigger)
		},
		{ signal }
	)
	root.addEventListener(
		'focusout',
		event => {
			const trigger = triggerOf(event.target)
			if (trigger !== null) leave(trigger)
		},
		{ signal }
	)

	return () => controller.abort()
}

const installs = new WeakMap<Document, { count: number; remove: () => void }>()

/**
 * @name installIconHover
 * @description Plays animated icons on hover or keyboard focus of a
 * [data-icon-trigger] ancestor, or of the icon itself. The first icon in a
 * chain waits a short delay and the next ones play immediately. Safe to call
 * from every component that renders icons: listeners are shared and removed
 * when the last caller cleans up.
 *
 * @example
 * useEffect(() => installIconHover(), [])
 */
export function installIconHover(root: Document = document) {
	const install = installs.get(root) ?? { count: 0, remove: listen(root) }
	install.count += 1
	installs.set(root, install)
	let removed = false

	return () => {
		if (removed) return
		removed = true
		install.count -= 1
		if (install.count > 0) return
		install.remove()
		installs.delete(root)
	}
}

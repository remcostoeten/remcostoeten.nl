import { motion, useInView, useReducedMotion, Variants } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface StaggeredRevealProps {
	children: React.ReactNode[]
	className?: string
	staggerDelay?: number
	initialDelay?: number
	duration?: number
	distance?: number
	triggerOnce?: boolean
	viewMargin?: string
	direction?: 'up' | 'down' | 'left' | 'right'
	disableBlur?: boolean
}

// Animation variants that can be reused across components
export const revealVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
		filter: 'blur(0px)' // Removed expensive blur
	},
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		filter: 'blur(0px)',
		transition: {
			duration: 0.5,
			delay: i * 0.08, // Consistent stagger delay
			ease: [0.16, 1, 0.3, 1] // Smooth easing
		}
	})
}

// Number animation variant that only animates when in view
export const numberVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: 'easeOut'
		}
	}
}

// Simple fade animation for backgrounds
export const fadeVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.4,
			ease: 'easeOut'
		}
	}
}

export function StaggeredReveal({
	children,
	className,
	staggerDelay = 0.08,
	initialDelay = 0,
	duration = 0.5,
	distance = 20,
	triggerOnce = true,
	viewMargin = '-50px',
	direction = 'up',
	disableBlur = true
}: StaggeredRevealProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(containerRef, {
		once: triggerOnce,
		margin: viewMargin as any
	})
	const shouldReduceMotion = useReducedMotion()

	// Get the appropriate transform based on direction
	const getTransform = () => {
		const axis = direction === 'left' || direction === 'right' ? 'x' : 'y'
		const value =
			direction === 'down' || direction === 'right' ? distance : -distance
		return { [axis]: value }
	}

	const variants: Variants = {
		hidden: {
			opacity: 0,
			...getTransform(),
			filter: disableBlur ? 'blur(0px)' : 'blur(4px)'
		},
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			y: 0,
			filter: 'blur(0px)',
			transition: {
				duration: shouldReduceMotion ? 0.1 : duration,
				delay: initialDelay + i * staggerDelay,
				ease: [0.16, 1, 0.3, 1]
			}
		})
	}

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>
	}

	return (
		<div ref={containerRef} className={cn('space-y-4', className)}>
			{children.map((child, i) => (
				<motion.div
					key={i}
					custom={i}
					variants={variants}
					initial="hidden"
					animate={isInView ? 'visible' : 'hidden'}
				>
					{child}
				</motion.div>
			))}
		</div>
	)
}

// Hook for consistent number animations
export function useAnimatedNumber(duration: number = 800) {
	const ref = useRef<HTMLSpanElement>(null)
	const isInView = useInView(ref, { once: true, margin: '-50px' as any })
	const shouldReduceMotion = useReducedMotion()

	return {
		ref,
		isInView,
		shouldReduceMotion: shouldReduceMotion || !isInView,
		duration: shouldReduceMotion ? 100 : duration
	}
}

'use client'

import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Send, Check, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type TSendStatus = 'idle' | 'sending' | 'success'

type Props = {
	status: TSendStatus
	className?: string
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const LABELS: Record<TSendStatus, string> = {
	idle: 'Send Message',
	sending: 'Sending...',
	success: 'Message sent'
}

export function SendButton({ status, className }: Props) {
	const shouldReduceMotion = useReducedMotion()
	const isBusy = status !== 'idle'

	const enter = shouldReduceMotion
		? { opacity: 0 }
		: { opacity: 0, y: 8, filter: 'blur(4px)' }
	const center = shouldReduceMotion
		? { opacity: 1 }
		: { opacity: 1, y: 0, filter: 'blur(0px)' }
	const exit = shouldReduceMotion
		? { opacity: 0 }
		: { opacity: 0, y: -8, filter: 'blur(4px)' }

	return (
		<motion.button
			type="submit"
			disabled={isBusy}
			aria-live="polite"
			whileTap={shouldReduceMotion || isBusy ? undefined : { scale: 0.97 }}
			transition={{ duration: 0.16, ease: EASE_OUT }}
			animate={{
				backgroundColor:
					status === 'success'
						? 'var(--color-emerald-600, #059669)'
						: 'var(--primary)'
			}}
			className={cn(
				'relative inline-flex h-9 w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-primary-foreground shadow',
				'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
				'disabled:pointer-events-none',
				status === 'idle' && 'hover:bg-primary/90',
				className
			)}
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.span
					key={status}
					initial={enter}
					animate={center}
					exit={exit}
					transition={{ duration: 0.2, ease: EASE_OUT }}
					className="inline-flex items-center gap-2"
				>
					{status === 'idle' && <Send className="h-4 w-4" />}
					{status === 'sending' && (
						<Loader2 className="h-4 w-4 animate-spin" />
					)}
					{status === 'success' && (
						<motion.span
							initial={
								shouldReduceMotion
									? undefined
									: { scale: 0.6, opacity: 0 }
							}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								type: 'spring',
								duration: 0.4,
								bounce: 0.35
							}}
							className="inline-flex"
						>
							<Check className="h-4 w-4" />
						</motion.span>
					)}
					{LABELS[status]}
				</motion.span>
			</AnimatePresence>
		</motion.button>
	)
}

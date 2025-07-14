import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import {
	type Frames,
	MotionGrid
} from '@/components/effects/motion-grid'

type TGridButtonProps = {
	onClick?: () => void
	gridSize: [number, number]
	frames: Frames
	cellClassName?: string
	cellActiveClassName?: string
	cellInactiveClassName?: string
	isLoading?: boolean
	children: ReactNode
	disabled?: boolean
	type?: 'button' | 'submit' | 'reset'
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
	size?: 'default' | 'sm' | 'lg' | 'icon'
	className?: string
}

const importingFrames = [
	[[2, 2]],
	[
		[1, 2],
		[2, 1],
		[2, 3],
		[3, 2]
	],
	[
		[2, 2],
		[0, 2],
		[1, 1],
		[1, 3],
		[2, 0],
		[2, 4],
		[3, 1],
		[3, 3],
		[4, 2]
	],
	[
		[0, 1],
		[0, 3],
		[1, 0],
		[1, 2],
		[1, 4],
		[2, 1],
		[2, 3],
		[3, 0],
		[3, 2],
		[3, 4],
		[4, 1],
		[4, 3]
	],
	[
		[0, 0],
		[0, 2],
		[0, 4],
		[1, 1],
		[1, 3],
		[2, 0],
		[2, 2],
		[2, 4],
		[3, 1],
		[3, 3],
		[4, 0],
		[4, 2],
		[4, 4]
	],
	[
		[0, 1],
		[0, 3],
		[1, 0],
		[1, 2],
		[1, 4],
		[2, 1],
		[2, 3],
		[3, 0],
		[3, 2],
		[3, 4],
		[4, 1],
		[4, 3]
	],
	[
		[0, 0],
		[0, 2],
		[0, 4],
		[1, 1],
		[1, 3],
		[2, 0],
		[2, 4],
		[3, 1],
		[3, 3],
		[4, 0],
		[4, 2],
		[4, 4]
	],
	[
		[0, 1],
		[1, 0],
		[3, 0],
		[4, 1],
		[0, 3],
		[1, 4],
		[3, 4],
		[4, 3]
	],
	[
		[0, 0],
		[0, 4],
		[4, 0],
		[4, 4]
	],
	[]
] as Frames

const arrowDownFrames = [
	[[2, 0]],
	[
		[1, 0],
		[2, 0],
		[3, 0],
		[2, 1]
	],
	[
		[2, 0],
		[1, 1],
		[2, 1],
		[3, 1],
		[2, 2]
	],
	[
		[2, 0],
		[2, 1],
		[1, 2],
		[2, 2],
		[3, 2],
		[2, 3]
	],
	[
		[2, 1],
		[2, 2],
		[1, 3],
		[2, 3],
		[3, 3],
		[2, 4]
	],
	[
		[2, 2],
		[2, 3],
		[1, 4],
		[2, 4],
		[3, 4]
	],
	[
		[2, 3],
		[2, 4]
	],
	[[2, 4]],
	[]
] as Frames

const arrowUpFrames = [
	[[2, 4]],
	[
		[1, 4],
		[2, 4],
		[3, 4],
		[2, 3]
	],
	[
		[2, 4],
		[1, 3],
		[2, 3],
		[3, 3],
		[2, 2]
	],
	[
		[2, 4],
		[2, 3],
		[1, 2],
		[2, 2],
		[3, 2],
		[2, 1]
	],
	[
		[2, 3],
		[2, 2],
		[1, 1],
		[2, 1],
		[3, 1],
		[2, 0]
	],
	[
		[2, 2],
		[2, 1],
		[1, 0],
		[2, 0],
		[3, 0]
	],
	[
		[2, 1],
		[2, 0]
	],
	[[2, 0]],
	[]
] as Frames

const syncingFrames = [...arrowDownFrames, ...arrowUpFrames] as Frames

const searchingFrames = [
	[
		[1, 0],
		[0, 1],
		[1, 1],
		[2, 1],
		[1, 2]
	],
	[
		[2, 0],
		[1, 1],
		[2, 1],
		[3, 1],
		[2, 2]
	],
	[
		[3, 0],
		[2, 1],
		[3, 1],
		[4, 1],
		[3, 2]
	],
	[
		[3, 1],
		[2, 2],
		[3, 2],
		[4, 2],
		[3, 3]
	],
	[
		[3, 2],
		[2, 3],
		[3, 3],
		[4, 3],
		[3, 4]
	],
	[
		[1, 2],
		[0, 3],
		[1, 3],
		[2, 3],
		[1, 4]
	],
	[
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 0],
		[1, 2],
		[2, 0],
		[2, 1],
		[2, 2]
	],
	[]
] as Frames

const busyFrames = [
	[
		[0, 1],
		[0, 2],
		[0, 3],
		[1, 2],
		[4, 1],
		[4, 2],
		[4, 3]
	],
	[
		[0, 1],
		[0, 2],
		[0, 3],
		[2, 3],
		[4, 2],
		[4, 3],
		[4, 4]
	],
	[
		[0, 1],
		[0, 2],
		[0, 3],
		[3, 4],
		[4, 2],
		[4, 3],
		[4, 4]
	],
	[
		[0, 1],
		[0, 2],
		[0, 3],
		[2, 3],
		[4, 2],
		[4, 3],
		[4, 4]
	],
	[
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 2],
		[4, 2],
		[4, 3],
		[4, 4]
	],
	[
		[0, 0],
		[0, 1],
		[0, 2],
		[2, 1],
		[4, 1],
		[4, 2],
		[4, 3]
	],
	[
		[0, 0],
		[0, 1],
		[0, 2],
		[3, 0],
		[4, 0],
		[4, 1],
		[4, 2]
	],
	[
		[0, 1],
		[0, 2],
		[0, 3],
		[2, 1],
		[4, 0],
		[4, 1],
		[4, 2]
	]
] as Frames

const savingFrames = [
	[
		[0, 0],
		[0, 1],
		[0, 2],
		[0, 3],
		[0, 4],
		[1, 0],
		[1, 1],
		[1, 2],
		[1, 3],
		[2, 0],
		[2, 1],
		[2, 2],
		[2, 3],
		[2, 4],
		[3, 0],
		[3, 1],
		[3, 2],
		[3, 3],
		[4, 0],
		[4, 1],
		[4, 2],
		[4, 3],
		[4, 4]
	],
	[
		[0, 0],
		[0, 1],
		[0, 2],
		[0, 3],
		[1, 0],
		[1, 1],
		[1, 2],
		[2, 0],
		[2, 1],
		[2, 2],
		[2, 3],
		[3, 0],
		[3, 1],
		[3, 2],
		[4, 0],
		[4, 1],
		[4, 2],
		[4, 3]
	],
	[
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 0],
		[1, 1],
		[2, 0],
		[2, 1],
		[2, 2],
		[3, 0],
		[3, 1],
		[4, 0],
		[4, 1],
		[4, 2],
		[4, 4],
		[3, 4],
		[2, 4],
		[1, 4],
		[0, 4]
	],
	[
		[0, 0],
		[0, 1],
		[1, 0],
		[2, 0],
		[2, 1],
		[3, 0],
		[4, 0],
		[4, 1],
		[4, 3],
		[3, 3],
		[2, 3],
		[1, 3],
		[0, 3],
		[4, 4],
		[3, 4],
		[2, 4],
		[1, 4],
		[0, 4]
	],
	[
		[0, 0],
		[2, 0],
		[4, 0],
		[4, 2],
		[3, 2],
		[2, 2],
		[1, 2],
		[0, 2],
		[4, 3],
		[3, 3],
		[2, 3],
		[1, 3],
		[0, 3],
		[4, 4],
		[3, 4],
		[2, 4],
		[1, 4],
		[0, 4]
	],
	[
		[0, 0],
		[1, 0],
		[2, 0],
		[3, 0],
		[4, 0],
		[4, 1],
		[3, 1],
		[2, 1],
		[1, 1],
		[0, 1],
		[4, 2],
		[3, 2],
		[2, 2],
		[1, 2],
		[0, 2],
		[4, 3],
		[3, 3],
		[2, 3],
		[1, 3],
		[0, 3],
		[4, 4],
		[3, 4],
		[2, 4],
		[1, 4],
		[0, 4]
	],
	[
		[0, 0],
		[1, 0],
		[2, 0],
		[3, 0],
		[4, 0],
		[4, 1],
		[3, 1],
		[2, 1],
		[1, 1],
		[0, 1],
		[4, 2],
		[3, 2],
		[2, 2],
		[1, 2],
		[0, 2],
		[4, 3],
		[3, 3],
		[2, 3],
		[1, 3],
		[0, 3],
		[4, 4],
		[3, 4],
		[2, 4],
		[1, 4],
		[0, 4]
	],
	[
		[0, 0],
		[1, 0],
		[2, 0],
		[3, 0],
		[4, 0],
		[4, 1],
		[3, 1],
		[2, 1],
		[1, 1],
		[0, 1],
		[4, 2],
		[3, 2],
		[2, 2],
		[1, 2],
		[0, 2],
		[4, 3],
		[3, 3],
		[2, 3],
		[1, 3],
		[0, 3],
		[4, 4],
		[3, 4],
		[2, 4],
		[1, 4],
		[0, 4]
	]
] as Frames

const initializingFrames = [
	[],
	[
		[1, 0],
		[3, 0]
	],
	[
		[1, 0],
		[3, 0],
		[0, 1],
		[1, 1],
		[2, 1],
		[3, 1],
		[4, 1]
	],
	[
		[1, 0],
		[3, 0],
		[0, 1],
		[1, 1],
		[2, 1],
		[3, 1],
		[4, 1],
		[0, 2],
		[1, 2],
		[2, 2],
		[3, 2],
		[4, 2]
	],
	[
		[1, 0],
		[3, 0],
		[0, 1],
		[1, 1],
		[2, 1],
		[3, 1],
		[4, 1],
		[0, 2],
		[1, 2],
		[2, 2],
		[3, 2],
		[4, 2],
		[1, 3],
		[2, 3],
		[3, 3]
	],
	[
		[1, 0],
		[3, 0],
		[0, 1],
		[1, 1],
		[2, 1],
		[3, 1],
		[4, 1],
		[0, 2],
		[1, 2],
		[2, 2],
		[3, 2],
		[4, 2],
		[1, 3],
		[2, 3],
		[3, 3],
		[2, 4]
	],
	[
		[1, 2],
		[2, 1],
		[2, 2],
		[2, 3],
		[3, 2]
	],
	[[2, 2]],
	[]
] as Frames

const states = {
	importing: {
		frames: importingFrames,
		label: 'Importing'
	},
	syncing: {
		frames: syncingFrames,
		label: 'Syncing'
	},
	searching: {
		frames: searchingFrames,
		label: 'Searching'
	},
	busy: {
		frames: busyFrames,
		label: 'Busy'
	},
	saving: {
		frames: savingFrames,
		label: 'Saving'
	},
	initializing: {
		frames: initializingFrames,
		label: 'Initializing'
	}
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Export frame types for use in other components
export { importingFrames, syncingFrames, searchingFrames, busyFrames, savingFrames, initializingFrames }

export function GridButton({ 
	onClick, 
	gridSize, 
	frames, 
	cellClassName, 
	cellActiveClassName, 
	cellInactiveClassName, 
	isLoading, 
	children, 
	disabled, 
	type = 'button', 
	variant = 'default', 
	size = 'default', 
	className 
}: TGridButtonProps) {
	return (
		<Button 
			onClick={onClick}
			disabled={disabled || isLoading}
			type={type}
			variant={variant}
			size={size}
				className={`px-4 h-11 gap-x-3 relative ${className || ''}`}
			asChild
		>
			<motion.button
				layout
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<motion.div layout='preserve-aspect'>
					<MotionGrid
						gridSize={gridSize}
						frames={frames}
						cellClassName={cellClassName || 'size-[3px]'}
						cellActiveClassName={cellActiveClassName || 'bg-white/70 dark:bg-black/70'}
						cellInactiveClassName={cellInactiveClassName || 'bg-white/20 dark:bg-black/20'}
						animate={isLoading}
					/>
				</motion.div>
				
				<span className='ml-2'>
					{isLoading ? 'Processing...' : children}
				</span>
			</motion.button>
		</Button>
	)
}

export const MotionGridDemo = () => {
	const [state, setState] = useState<keyof typeof states>('importing')

	const runStates = async () => {
		while (true) {
			for (const state of Object.keys(
				states
			) as (keyof typeof states)[]) {
				setState(state)
				await sleep(3000)
			}
		}
	}

	useEffect(() => {
		runStates()
	}, [])

	return (
		<Button size='lg' className='px-3 h-11 gap-x-3 relative' asChild>
			<motion.button
				layout
				whileHover={{ opacity: 0.8 }}
				whileTap={{ opacity: 0.6 }}
			>
				<motion.div layout='preserve-aspect'>
					<MotionGrid
						gridSize={[5, 5]}
						frames={states[state].frames}
						cellClassName='size-[3px]'
						cellActiveClassName='bg-white/70 dark:bg-black/70'
						cellInactiveClassName='bg-white/20 dark:bg-black/20'
					/>
				</motion.div>

				<span className='ml-2'>
					{states[state].label}
				</span>
			</motion.button>
		</Button>
	)
}

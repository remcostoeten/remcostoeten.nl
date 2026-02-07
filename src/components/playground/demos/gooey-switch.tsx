'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export type AnimationCfg = {
	bezier?: readonly [number, number, number, number]
	duration?: number
}

export type SwitchProps = {
	defaultOn?: boolean
	onChange?: (on: boolean) => void
	size?: 'sm' | 'md' | 'lg'
	anim?: AnimationCfg
}

type SizeCfg = { width: number; height: number; blob: number }

const SIZE_MAP = {
	sm: { width: 64, height: 32, blob: 24 },
	md: { width: 80, height: 40, blob: 30 },
	lg: { width: 120, height: 56, blob: 42 }
} as const satisfies Record<'sm' | 'md' | 'lg', SizeCfg>

function GooeySwitch({
	defaultOn = false,
	onChange,
	size = 'lg',
	anim
}: SwitchProps) {
	const [isOn, setIsOn] = useState(defaultOn)

	const layout = useMemo(
		function () {
			const cfg = SIZE_MAP[size]
			const padding = (cfg.height - cfg.blob) / 2
			const travel = cfg.width - cfg.blob - padding * 2
			return { cfg, padding, travel }
		},
		[size]
	)

	const hasAnim = !!anim
	const duration = anim?.duration ?? 0.5
	const bezier = anim?.bezier ?? [0.25, 0.1, 0.25, 1]

	const mainX = useSpring(isOn ? layout.travel : 0, {
		stiffness: 300,
		damping: 25,
		mass: 1.2
	})

	const trailX1 = useSpring(isOn ? layout.travel : 0, {
		stiffness: 200,
		damping: 20,
		mass: 1.5
	})

	const trailX2 = useSpring(isOn ? layout.travel : 0, {
		stiffness: 150,
		damping: 18,
		mass: 2
	})

	const trailX3 = useSpring(isOn ? layout.travel : 0, {
		stiffness: 120,
		damping: 22,
		mass: 2.5
	})

	const scaleX = useTransform(
		mainX,
		[0, layout.travel * 0.5, layout.travel],
		[1, 1.25, 1]
	)
	const scaleY = useTransform(
		mainX,
		[0, layout.travel * 0.5, layout.travel],
		[1, 0.8, 1]
	)

	const onToggle = useCallback(
		function () {
			setIsOn(function (prev) {
				const next = !prev

				if (!hasAnim) {
					const target = next ? layout.travel : 0
					mainX.set(target)
					trailX1.set(target)
					trailX2.set(target)
					trailX3.set(target)
				}

				onChange?.(next)
				return next
			})
		},
		[hasAnim, layout.travel, onChange, mainX, trailX1, trailX2, trailX3]
	)

	return (
		<div className="relative">
			<svg width="0" height="0" className="absolute">
				<defs>
					<filter id="gooey-filter">
						<feGaussianBlur
							in="SourceGraphic"
							stdDeviation="6"
							result="blur"
						/>
						<feColorMatrix
							in="blur"
							mode="matrix"
							values="1 0 0 0 0
									0 1 0 0 0
									0 0 1 0 0
									0 0 0 20 -8"
							result="gooey"
						/>
						<feComposite
							in="SourceGraphic"
							in2="gooey"
							operator="atop"
						/>
					</filter>
				</defs>
			</svg>

			<button
				type="button"
				role="switch"
				aria-checked={isOn}
				onClick={onToggle}
				className={[
					'relative overflow-hidden rounded-full cursor-pointer transition-all duration-300 outline-none',
					isOn ? 'gooey-glow-active' : 'gooey-glow'
				].join(' ')}
				style={{ width: layout.cfg.width, height: layout.cfg.height }}
			>
				<motion.div
					className="absolute inset-0 rounded-full bg-gooey-track"
					animate={{
						backgroundColor: isOn
							? 'hsl(var(--gooey-track-active))'
							: 'hsl(var(--gooey-track))'
					}}
					transition={{ duration: 0.2 }}
				/>

				<div
					className="absolute inset-0"
					style={{ filter: 'url(#gooey-filter)' }}
				>
					<motion.div
						className="absolute rounded-full bg-gooey-blob"
						animate={
							hasAnim
								? { x: isOn ? layout.travel : 0 }
								: undefined
						}
						transition={
							hasAnim
								? { duration: duration * 1.4, ease: bezier }
								: undefined
						}
						style={{
							x: hasAnim ? undefined : trailX3,
							left: layout.padding,
							top: '50%',
							translateY: '-50%',
							width: layout.cfg.blob * 0.45,
							height: layout.cfg.blob * 0.45
						}}
					/>

					<motion.div
						className="absolute rounded-full bg-gooey-blob"
						animate={
							hasAnim
								? { x: isOn ? layout.travel : 0 }
								: undefined
						}
						transition={
							hasAnim
								? { duration: duration * 1.2, ease: bezier }
								: undefined
						}
						style={{
							x: hasAnim ? undefined : trailX2,
							left: layout.padding,
							top: '50%',
							translateY: '-50%',
							width: layout.cfg.blob * 0.6,
							height: layout.cfg.blob * 0.6
						}}
					/>

					<motion.div
						className="absolute rounded-full bg-gooey-blob"
						animate={
							hasAnim
								? { x: isOn ? layout.travel : 0 }
								: undefined
						}
						transition={
							hasAnim
								? { duration: duration * 1.1, ease: bezier }
								: undefined
						}
						style={{
							x: hasAnim ? undefined : trailX1,
							left: layout.padding,
							top: '50%',
							translateY: '-50%',
							width: layout.cfg.blob * 0.75,
							height: layout.cfg.blob * 0.75
						}}
					/>

					<motion.div
						className="absolute rounded-full bg-gooey-blob"
						animate={
							hasAnim
								? {
										x: isOn ? layout.travel : 0,
										scaleX: [1, 1.25, 1],
										scaleY: [1, 0.8, 1]
									}
								: undefined
						}
						transition={
							hasAnim ? { duration, ease: bezier } : undefined
						}
						style={{
							x: hasAnim ? undefined : mainX,
							scaleX: hasAnim ? undefined : scaleX,
							scaleY: hasAnim ? undefined : scaleY,
							left: layout.padding,
							top: '50%',
							translateY: '-50%',
							width: layout.cfg.blob,
							height: layout.cfg.blob
						}}
					/>

					<motion.div
						className="absolute rounded-full bg-gooey-blob"
						animate={{
							x: hasAnim ? (isOn ? layout.travel : 0) : undefined,
							y: isOn ? [0, -3, 0] : [0, 3, 0]
						}}
						transition={{
							x: hasAnim ? { duration, ease: bezier } : undefined,
							y: {
								duration: 2,
								repeat: Infinity,
								ease: 'easeInOut'
							}
						}}
						style={{
							x: hasAnim ? undefined : mainX,
							left: layout.padding + layout.cfg.blob * 0.15,
							top: '28%',
							width: layout.cfg.blob * 0.3,
							height: layout.cfg.blob * 0.3
						}}
					/>

					<motion.div
						className="absolute rounded-full bg-gooey-blob"
						animate={{
							x: hasAnim ? (isOn ? layout.travel : 0) : undefined,
							y: isOn ? [0, 4, 0] : [0, -4, 0]
						}}
						transition={{
							x: hasAnim ? { duration, ease: bezier } : undefined,
							y: {
								duration: 2.5,
								repeat: Infinity,
								ease: 'easeInOut',
								delay: 0.3
							}
						}}
						style={{
							x: hasAnim ? undefined : mainX,
							left: layout.padding + layout.cfg.blob * 0.2,
							bottom: '26%',
							width: layout.cfg.blob * 0.25,
							height: layout.cfg.blob * 0.25
						}}
					/>
				</div>
			</button>
		</div>
	)
}

type PageProps = {
	title: string
	children: React.ReactNode
}

function PageCard({ title, children }: PageProps) {
	return (
		<div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
			<div className="mb-4 text-sm font-medium text-neutral-200">
				{title}
			</div>
			{children}
		</div>
	)
}

// Compact preview for the playground card
export function GooeySwitchDemo() {
	return (
		<div className="flex h-40 items-center justify-center p-4 bg-neutral-950/50">
			<style jsx global>{`
				:root {
					--gooey-track: 220 6% 18%;
					--gooey-track-active: 220 6% 24%;
					--gooey-blob: 0 0% 92%;
				}
				.bg-gooey-track {
					background: hsl(var(--gooey-track));
				}
				.bg-gooey-blob {
					background: hsl(var(--gooey-blob));
				}
				.gooey-glow {
					box-shadow:
						0 0 0 1px rgba(255, 255, 255, 0.06),
						inset 0 0 0 1px rgba(0, 0, 0, 0.25);
				}
				.gooey-glow-active {
					box-shadow:
						0 0 0 1px rgba(255, 255, 255, 0.12),
						0 10px 30px rgba(0, 0, 0, 0.45),
						inset 0 0 0 1px rgba(0, 0, 0, 0.2);
				}
				:focus-visible {
					outline: 2px solid rgba(255, 255, 255, 0.22);
					outline-offset: 2px;
				}
				input[type='range'] {
					accent-color: #d4d4d4;
				}
			`}</style>
			<GooeySwitch size="lg" />
		</div>
	)
}

// Full demo component available for copy-paste or expanded view
export function GooeySwitchFullDemo() {
	const [size, setSize] = useState<'sm' | 'md' | 'lg'>('lg')
	const [useAnim, setUseAnim] = useState(true)
	const [dur, setDur] = useState(0.5)
	const [isOnA, setIsOnA] = useState(false)
	const [isOnB, setIsOnB] = useState(false)

	const anim = useMemo<AnimationCfg | undefined>(
		function () {
			if (!useAnim) return undefined
			return { duration: dur, bezier: [0.25, 0.1, 0.25, 1] }
		},
		[useAnim, dur]
	)

	return (
		<div className="p-4 text-neutral-200">
			<div className="mx-auto w-full max-w-4xl">
				<div className="mb-8">
					<div className="mt-2 text-sm text-neutral-400">
						Left: spring mode, right: tween mode (custom anim)
					</div>
				</div>

				<PageCard title="Controls">
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<div className="text-xs text-neutral-400">Size</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setSize('sm')}
									className={[
										'rounded-lg border px-3 py-2 text-sm',
										size === 'sm'
											? 'border-neutral-700 bg-neutral-900 text-neutral-100'
											: 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900/50'
									].join(' ')}
								>
									sm
								</button>
								<button
									type="button"
									onClick={() => setSize('md')}
									className={[
										'rounded-lg border px-3 py-2 text-sm',
										size === 'md'
											? 'border-neutral-700 bg-neutral-900 text-neutral-100'
											: 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900/50'
									].join(' ')}
								>
									md
								</button>
								<button
									type="button"
									onClick={() => setSize('lg')}
									className={[
										'rounded-lg border px-3 py-2 text-sm',
										size === 'lg'
											? 'border-neutral-700 bg-neutral-900 text-neutral-100'
											: 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900/50'
									].join(' ')}
								>
									lg
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-xs text-neutral-400">
								Tween mode
							</div>
							<button
								type="button"
								onClick={() => setUseAnim(v => !v)}
								className={[
									'rounded-lg border px-3 py-2 text-sm',
									useAnim
										? 'border-neutral-700 bg-neutral-900 text-neutral-100'
										: 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900/50'
								].join(' ')}
							>
								{useAnim ? 'enabled' : 'disabled'}
							</button>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs text-neutral-400">
								<span>Duration</span>
								<span className="tabular-nums">
									{dur.toFixed(2)}s
								</span>
							</div>
							<input
								type="range"
								min={0.2}
								max={1.2}
								step={0.05}
								value={dur}
								onChange={e =>
									setDur(Number(e.currentTarget.value))
								}
								className="w-full"
							/>
						</div>
					</div>
				</PageCard>

				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<PageCard title="Spring mode">
						<div className="flex items-center justify-between gap-4">
							<GooeySwitch
								size={size}
								defaultOn={isOnA}
								onChange={setIsOnA}
							/>
							<div className="text-sm text-neutral-400">
								state:{' '}
								<span className="tabular-nums text-neutral-200">
									{isOnA ? 'on' : 'off'}
								</span>
							</div>
						</div>
					</PageCard>

					<PageCard title="Tween mode">
						<div className="flex items-center justify-between gap-4">
							<GooeySwitch
								size={size}
								anim={anim}
								defaultOn={isOnB}
								onChange={setIsOnB}
							/>
							<div className="text-sm text-neutral-400">
								state:{' '}
								<span className="tabular-nums text-neutral-200">
									{isOnB ? 'on' : 'off'}
								</span>
							</div>
						</div>
					</PageCard>
				</div>
			</div>
		</div>
	)
}

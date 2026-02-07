'use client'

import { useState, useEffect } from 'react'

export function EnvGeneratorDemo() {
	const [step, setStep] = useState(0)
	const steps = [
		{ prompt: 'DATABASE_URL:', value: 'postgresql://...' },
		{ prompt: 'API_KEY:', value: 'sk_live_xxx' },
		{ prompt: 'NODE_ENV:', value: 'production' }
	]

	useEffect(
		function animate() {
			const timer = setInterval(function nextStep() {
				setStep(function getNext(s) {
					return (s + 1) % (steps.length + 1)
				})
			}, 1500)
			return function cleanup() {
				clearInterval(timer)
			}
		},
		[steps.length]
	)

	return (
		<div className="p-4 font-mono text-xs bg-zinc-950/50 space-y-1">
			<div className="text-muted-foreground/40">$ npx env-generator</div>
			{steps.slice(0, step).map(function renderStep(s, i) {
				return (
					<div key={i} className="flex gap-2">
						<span className="text-cyan-400">{s.prompt}</span>
						<span className="text-muted-foreground/60">
							{s.value}
						</span>
					</div>
				)
			})}
			{step === steps.length && (
				<div className="text-emerald-400 mt-2">✓ .env generated</div>
			)}
		</div>
	)
}

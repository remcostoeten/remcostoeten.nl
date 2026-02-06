'use client'

import { useState, useEffect } from 'react'

export function PortKillerDemo() {
	const [killed, setKilled] = useState<number[]>([])

	useEffect(function animate() {
		const ports = [3000, 5173, 8080]
		let i = 0
		const timer = setInterval(function nextPort() {
			if (i < ports.length) {
				setKilled(function addPort(k) {
					return [...k, ports[i]]
				})
				i++
			} else {
				setKilled([])
				i = 0
			}
		}, 800)
		return function cleanup() {
			clearInterval(timer)
		}
	}, [])

	return (
		<div className="p-4 font-mono text-xs bg-zinc-950/50 space-y-1">
			<div className="text-muted-foreground/40">
				$ npx port-killer 3000 5173 8080
			</div>
			{killed.map(function renderKilled(port) {
				return (
					<div key={port} className="text-emerald-400">
						✓ Killed process on port {port}
					</div>
				)
			})}
		</div>
	)
}

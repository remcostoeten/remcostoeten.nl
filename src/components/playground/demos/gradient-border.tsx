'use client'

export function GradientBorderDemo() {
	return (
		<div className="flex items-center justify-center p-6">
			<div className="relative p-[1px] overflow-hidden">
				<div
					className="absolute inset-0 animate-spin-slow"
					style={{
						background:
							'conic-gradient(from 0deg, #667eea, #764ba2, #f59e0b, #667eea)',
						animationDuration: '3s'
					}}
				/>
				<div className="relative bg-background px-6 py-4">
					<p className="text-sm text-foreground">
						Gradient border card
					</p>
					<p className="text-xs text-muted-foreground/60">
						CSS animation effect
					</p>
				</div>
			</div>
		</div>
	)
}

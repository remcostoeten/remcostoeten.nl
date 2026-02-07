import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET(request: Request) {
	const url = new URL(request.url)
	const title = url.searchParams.get('title') || 'Remco Stoeten'
	const subtitle =
		url.searchParams.get('subtitle') || 'Frontend Engineer • Netherlands'

	return new ImageResponse(
		<div
			tw="flex flex-col w-full h-full items-center justify-center"
			style={{
				background: 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)'
			}}
		>
			{/* Subtle grid pattern overlay */}
			<div
				tw="absolute inset-0 opacity-20"
				style={{
					backgroundImage:
						'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)',
					backgroundSize: '40px 40px'
				}}
			/>

			{/* Content container */}
			<div tw="flex flex-col items-start justify-center px-20 py-16 w-full h-full">
				{/* Top accent line */}
				<div
					tw="w-24 h-1 mb-8"
					style={{
						background:
							'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
					}}
				/>

				{/* Title */}
				<h1
					tw="text-6xl font-bold tracking-tight mb-4"
					style={{
						color: '#fafafa',
						fontFamily: 'system-ui, sans-serif'
					}}
				>
					{title}
				</h1>

				{/* Subtitle */}
				<p
					tw="text-2xl"
					style={{
						color: '#a1a1aa',
						fontFamily: 'ui-monospace, monospace'
					}}
				>
					{subtitle}
				</p>

				{/* Bottom branding */}
				<div tw="absolute bottom-16 left-20 flex items-center">
					<div
						tw="w-3 h-3 rounded-full mr-3"
						style={{ background: '#22c55e' }}
					/>
					<span
						tw="text-lg"
						style={{
							color: '#71717a',
							fontFamily: 'ui-monospace, monospace'
						}}
					>
						remcostoeten.com
					</span>
				</div>
			</div>
		</div>,
		{
			width: 1200,
			height: 630
		}
	)
}

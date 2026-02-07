import { ImageResponse } from 'next/og'

export const alt = 'Blog - Engineering, Design & Development'
export const size = {
	width: 1200,
	height: 630
}

export const contentType = 'image/png'

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				fontSize: 128,
				background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#ffffff',
				fontFamily: 'system-ui, sans-serif'
			}}
		>
			<div
				style={{
					fontSize: '72px',
					fontWeight: 'bold',
					marginBottom: '20px',
					textAlign: 'center',
					background:
						'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text'
				}}
			>
				Blog
			</div>
			<div
				style={{
					fontSize: '32px',
					fontWeight: 'normal',
					color: '#94a3b8',
					textAlign: 'center',
					maxWidth: '80%'
				}}
			>
				Thoughts on engineering, design, and web development
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: '40px',
					fontSize: '24px',
					color: '#64748b',
					fontWeight: 'normal'
				}}
			>
				React • TypeScript • CSS • Design Systems
			</div>
		</div>,
		{
			...size
		}
	)
}

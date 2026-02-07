import { ImageResponse } from 'next/og'

export const alt = 'Topics - Blog Categories & Tags'
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
						'linear-gradient(135deg, #84cc16 0%, #22c55e 100%)',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text'
				}}
			>
				Topics
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
				Browse blog posts by topic, category, or tag
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
				Engineering • Design • React • CSS • TypeScript
			</div>
		</div>,
		{
			...size
		}
	)
}

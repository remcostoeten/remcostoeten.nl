import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import {
	TOOL_CATEGORY_LABELS,
	getToolBySlug
} from '@/features/miscellaneous/constants/tools'
import { getToolSeoContent } from '@/features/miscellaneous/constants/tool-seo'

export const size = { width: 1200, height: 630 }

type Props = {
	params: Promise<{ slug: string }>
	backgroundUrl?: string
}

const ACCENTS = {
	text: '#a78bfa',
	geo: '#38bdf8',
	media: '#4f7cff'
} as const

export default async function Image({ params, backgroundUrl }: Props) {
	const { slug } = await params
	const tool = getToolBySlug(slug)
	if (!tool || tool.status !== 'available') notFound()

	const seo = getToolSeoContent(slug)
	const backgroundDataUrl = backgroundUrl
		? backgroundUrl
		: `data:image/png;base64,${(
				await readFile(
					join(process.cwd(), 'public/images/tools-og-backdrop.png')
				)
			).toString('base64')}`
	const accent = ACCENTS[tool.category]

	return new ImageResponse(
		<div
			style={{
				position: 'relative',
				display: 'flex',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				background: '#050608',
				color: '#f8fafc',
				fontFamily: 'Geist'
			}}
		>
			<img
				alt=""
				src={backgroundDataUrl}
				width={size.width}
				height={size.height}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover'
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					background:
						'linear-gradient(90deg, rgba(5,6,8,0.99) 0%, rgba(5,6,8,0.96) 52%, rgba(5,6,8,0.78) 64%, rgba(5,6,8,0.15) 88%, rgba(5,6,8,0.04) 100%)'
				}}
			/>

			<div
				style={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					width: '760px',
					padding: '54px 64px'
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
					<div
						style={{
							display: 'flex',
							width: 12,
							height: 12,
							borderRadius: 999,
							background: accent,
							boxShadow: `0 0 24px ${accent}`
						}}
					/>
					<div
						style={{
							display: 'flex',
							fontSize: 20,
							letterSpacing: 3,
							textTransform: 'uppercase',
							color: '#a1a1aa'
						}}
					>
						{TOOL_CATEGORY_LABELS[tool.category]} tool
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div
						style={{
							display: 'flex',
							fontSize: tool.name.length > 24 ? 60 : 72,
							lineHeight: 1.02,
							letterSpacing: -3,
							fontWeight: 600
						}}
					>
						{tool.name}
					</div>
					<div
						style={{
							display: 'flex',
							marginTop: 24,
							maxWidth: 650,
							fontSize: 25,
							lineHeight: 1.35,
							color: '#c4c4cc'
						}}
					>
						{seo?.metaDescription ?? tool.description}
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						fontSize: 19,
						color: '#a1a1aa'
					}}
				>
					<div style={{ display: 'flex' }}>remcostoeten.nl/tools</div>
					<div
						style={{
							display: 'flex',
							color: '#d4d4d8',
							letterSpacing: 2
						}}
					>
						LOCAL · PRIVATE · FREE
					</div>
				</div>
			</div>
		</div>,
		{ ...size }
	)
}

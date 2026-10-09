import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type GlyphProps = {
	className?: string
}

const EASE = 'duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]'

function Glyph({
	className,
	viewBox = '0 0 16 16',
	children
}: GlyphProps & { viewBox?: string; children: ReactNode }) {
	return (
		<svg
			className={cn('size-3.5 shrink-0 overflow-visible', className)}
			viewBox={viewBox}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.25}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{children}
		</svg>
	)
}

export function BookGlyph({ className }: GlyphProps) {
	return (
		<Glyph className={className}>
			<path d="M8 4.25C6.5 3.25 4 3 1.75 3.25v9C4 12 6.5 12.25 8 13.25" />
			<path d="M8 4.25c1.5-1 4-1.25 6.25-1v9C12 12 9.5 12.25 8 13.25Z" />
			<path
				d="M8 4.25c1.25-.75 2.75-1 4.25-.9v8.15c-1.5-.1-3 .15-4.25.9"
				className={cn(
					'origin-[8px_8px] transition-transform [transform-box:view-box] group-hover/glyph:-scale-x-100 group-focus-visible/glyph:-scale-x-100 motion-reduce:transition-none',
					EASE
				)}
			/>
		</Glyph>
	)
}

export function BoxGlyph({ className }: GlyphProps) {
	return (
		<Glyph className={className}>
			<path d="M2.25 5.25v5.5L8 14l5.75-3.25v-5.5" />
			<path d="M8 8.5V14" />
			<path
				d="M2.25 5.25 8 2l5.75 3.25L8 8.5Z"
				className={cn(
					'transition-transform group-hover/glyph:-translate-y-[1.75px] group-focus-visible/glyph:-translate-y-[1.75px] motion-reduce:transition-none',
					EASE
				)}
			/>
		</Glyph>
	)
}

export function GithubGlyph({ className }: GlyphProps) {
	return (
		<Glyph className={className} viewBox="0 0 24 24">
			<path
				strokeWidth={1.9}
				d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
			/>
			<path
				strokeWidth={1.9}
				d="M9 18c-4.51 2-5-2-7-2"
				className="origin-[9px_18px] [transform-box:view-box] group-hover/glyph:animate-[glyph-wag_0.6s_ease-in-out] group-focus-visible/glyph:animate-[glyph-wag_0.6s_ease-in-out] motion-reduce:animate-none"
			/>
		</Glyph>
	)
}

export function GlobeGlyph({ className }: GlyphProps) {
	return (
		<Glyph className={className}>
			<circle cx="8" cy="8" r="6.25" />
			<path d="M1.75 8h12.5" />
			<ellipse
				cx="8"
				cy="8"
				rx="2.75"
				ry="6.25"
				className="origin-center [transform-box:fill-box] group-hover/glyph:animate-[glyph-turn_0.8s_ease-in-out] group-focus-visible/glyph:animate-[glyph-turn_0.8s_ease-in-out] motion-reduce:animate-none"
			/>
		</Glyph>
	)
}

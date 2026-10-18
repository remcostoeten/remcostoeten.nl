import { Caveat, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import type { FontPair } from './types'

const instrumentSans = Instrument_Sans({
	subsets: ['latin'],
	variable: '--font-instrument-sans'
})
const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains-mono'
})
const caveat = Caveat({
	subsets: ['latin'],
	weight: ['500', '600'],
	variable: '--font-caveat',
	preload: false
})

export const DEFAULT_FONT_PAIR_ID = 'instrument-jetbrains'

export const FONT_PAIRS: FontPair[] = [
	{
		id: DEFAULT_FONT_PAIR_ID,
		sans: { name: 'Instrument Sans', variable: '--font-instrument-sans' },
		mono: { name: 'JetBrains Mono', variable: '--font-jetbrains-mono' }
	},
	{
		id: 'geist',
		sans: { name: 'Geist', variable: '--font-geist' },
		mono: { name: 'Geist Mono', variable: '--font-geist-mono' }
	},
	{
		id: 'plex',
		sans: { name: 'IBM Plex Sans', variable: '--font-plex-sans' },
		mono: { name: 'IBM Plex Mono', variable: '--font-plex-mono' }
	},
	{
		id: 'space',
		sans: { name: 'Space Grotesk', variable: '--font-space-grotesk' },
		mono: { name: 'Space Mono', variable: '--font-space-mono' }
	},
	{
		id: 'dm',
		sans: { name: 'DM Sans', variable: '--font-dm-sans' },
		mono: { name: 'DM Mono', variable: '--font-dm-mono' }
	},
	{
		id: 'ubuntu',
		sans: { name: 'Ubuntu Sans', variable: '--font-ubuntu-sans' },
		mono: { name: 'Ubuntu Sans Mono', variable: '--font-ubuntu-sans-mono' }
	},
	{
		id: 'hanken-martian',
		sans: { name: 'Hanken Grotesk', variable: '--font-hanken-grotesk' },
		mono: { name: 'Martian Mono', variable: '--font-martian-mono' }
	},
	{
		id: 'inter-fira',
		sans: { name: 'Inter Tight', variable: '--font-inter-tight' },
		mono: { name: 'Fira Code', variable: '--font-fira-code' }
	}
]

export const defaultFontVariables = [
	instrumentSans.variable,
	jetbrainsMono.variable,
	caveat.variable
].join(' ')

export async function loadPreviewFontVariables() {
	if (process.env.NODE_ENV === 'production') return ''

	const { previewFontVariables } = await import('./preview-fonts')
	return previewFontVariables
}

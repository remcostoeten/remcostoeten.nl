import {
	Caveat,
	DM_Mono,
	DM_Sans,
	Fira_Code,
	Geist,
	Geist_Mono,
	Hanken_Grotesk,
	IBM_Plex_Mono,
	IBM_Plex_Sans,
	Instrument_Sans,
	Inter_Tight,
	JetBrains_Mono,
	Martian_Mono,
	Space_Grotesk,
	Space_Mono,
	Ubuntu_Sans,
	Ubuntu_Sans_Mono
} from 'next/font/google'
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

const geist = Geist({
	subsets: ['latin'],
	variable: '--font-geist',
	preload: false
})
const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-geist-mono',
	preload: false
})
const plexSans = IBM_Plex_Sans({
	subsets: ['latin'],
	variable: '--font-plex-sans',
	preload: false
})
const plexMono = IBM_Plex_Mono({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	variable: '--font-plex-mono',
	preload: false
})
const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	variable: '--font-space-grotesk',
	preload: false
})
const spaceMono = Space_Mono({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-space-mono',
	preload: false
})
const dmSans = DM_Sans({
	subsets: ['latin'],
	variable: '--font-dm-sans',
	preload: false
})
const dmMono = DM_Mono({
	subsets: ['latin'],
	weight: ['400', '500'],
	variable: '--font-dm-mono',
	preload: false
})
const ubuntuSans = Ubuntu_Sans({
	subsets: ['latin'],
	variable: '--font-ubuntu-sans',
	preload: false
})
const ubuntuSansMono = Ubuntu_Sans_Mono({
	subsets: ['latin'],
	variable: '--font-ubuntu-sans-mono',
	preload: false
})
const hankenGrotesk = Hanken_Grotesk({
	subsets: ['latin'],
	variable: '--font-hanken-grotesk',
	preload: false
})
const martianMono = Martian_Mono({
	subsets: ['latin'],
	variable: '--font-martian-mono',
	preload: false
})
const interTight = Inter_Tight({
	subsets: ['latin'],
	variable: '--font-inter-tight',
	preload: false
})
const firaCode = Fira_Code({
	subsets: ['latin'],
	variable: '--font-fira-code',
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

export const previewFontVariables = [
	geist,
	geistMono,
	plexSans,
	plexMono,
	spaceGrotesk,
	spaceMono,
	dmSans,
	dmMono,
	ubuntuSans,
	ubuntuSansMono,
	hankenGrotesk,
	martianMono,
	interTight,
	firaCode
]
	.map(font => font.variable)
	.join(' ')

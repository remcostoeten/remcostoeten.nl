import {
	DM_Mono,
	DM_Sans,
	Fira_Code,
	Geist,
	Geist_Mono,
	Hanken_Grotesk,
	IBM_Plex_Mono,
	IBM_Plex_Sans,
	Inter_Tight,
	Martian_Mono,
	Space_Grotesk,
	Space_Mono,
	Ubuntu_Sans,
	Ubuntu_Sans_Mono
} from 'next/font/google'

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

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Press_Start_2P } from 'next/font/google'

// Toggle this to true to enable the pixel font
export const ENABLE_PIXEL_FONT = true

const pixelFont = Press_Start_2P({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-pixel'
})

export function getBodyFonts() {
    if (ENABLE_PIXEL_FONT) {
        // Return pixel font variable and className
        // We remove font-sans so pixel font takes precedence via its className
        return `${pixelFont.variable} ${pixelFont.className}`
    }

    // Default behavior: Geist variables + font-sans utility
    return `${GeistSans.variable} ${GeistMono.variable} font-sans`
}

import { readdir } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'
import { requireDevToolsAccess } from '@/lib/dev-access'


export const dynamic = 'force-dynamic' // Ensure this route is dynamic

const PAGE_EXTENSIONS = new Set(['.tsx', '.js', '.jsx'])

async function findPageFiles(rootDir: string, currentDir = rootDir): Promise<string[]> {
    const entries = await readdir(currentDir, { withFileTypes: true })
    const files = await Promise.all(entries.map(async entry => {
        if (entry.name.startsWith('.') || entry.name.startsWith('_')) return []

        const fullPath = path.join(currentDir, entry.name)
        const relativePath = path.relative(rootDir, fullPath)

        if (entry.isDirectory()) {
            if (entry.name === 'api') return []
            return findPageFiles(rootDir, fullPath)
        }

        if (!entry.isFile()) return []

        const parsed = path.parse(entry.name)
        const isPageFile = parsed.name === 'page' && PAGE_EXTENSIONS.has(parsed.ext)
        return isPageFile ? [relativePath] : []
    }))

    return files.flat()
}

// Helper to format route label
function formatRouteLabel(routePath: string) {
    if (routePath === '/') return 'Home'

    const segments = routePath.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    if (!lastSegment) return 'Home'

    return lastSegment
        .replace(/-/g, ' ')
        .replace(/^\w/, c => c.toUpperCase())
}

export async function GET() {
    const denied = await requireDevToolsAccess()
    if (denied) return denied

    try {
        const cwd = process.cwd()
        const appDir = path.join(cwd, 'src/app')

        const files = await findPageFiles(appDir)

        const routes = files.map(file => {
            // file is relative to appDir, e.g. "(marketing)/about/page.tsx"

            // Remove /page.tsx suffix
            const dirPath = path.dirname(file)

            // Split by separator (handle both / and \ just in case, though glob usually returns /)
            const segments = dirPath.split(path.sep)

            const cleanSegments = segments.filter(segment => {
                // Remove route groups like (marketing)
                return !segment.startsWith('(') || !segment.endsWith(')')
            }).filter(segment => segment !== '.') // remove . if present

            const routePath = '/' + cleanSegments.join('/')

            // Normalize resulting path
            const finalPath = routePath === '/' ? '/' : routePath.replace(/\/$/, '')

            return {
                path: finalPath,
                label: formatRouteLabel(finalPath),
                isDynamic: finalPath.includes('[')
            }
        })

        // Remove duplicates (e.g. if (marketing)/page.tsx and (auth)/page.tsx both map to / ?? That shouldn't happen in Next.js but good safeguard)
        // Also handling the root page: "page.tsx" at root -> dirname "." -> path "/"

        const uniqueRoutes = Array.from(new Map(routes.map(item => [item.path, item])).values())
            .sort((a, b) => {
                if (a.path === '/') return -1
                if (b.path === '/') return 1
                return a.path.localeCompare(b.path)
            })

        return NextResponse.json({ routes: uniqueRoutes })
    } catch (error) {
        console.error('Error scanning routes:', error)
        return NextResponse.json({ error: 'Failed to scan routes' }, { status: 500 })
    }
}

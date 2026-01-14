export type RouteItem = {
  path: string
  label: string
  isDynamic: boolean
}

const ROUTE_PATHS = [
  '/',
  '/admin',
  '/blog',
  '/blog/[...slug]',
  '/blog/topics',
  '/blog/topics/[topic]',
  '/dev/spotify',
  '/playground',
  '/privacy',
  '/terms',
]

function toKebabLabel(path: string): string {
  if (path === '/') return 'home'
  return path
    .split('/')
    .filter(Boolean)
    .filter(segment => !segment.startsWith('['))
    .join('-')
}

export function generateRoutes(): RouteItem[] {
  return ROUTE_PATHS.map(path => ({
    path,
    label: toKebabLabel(path),
    isDynamic: path.includes('['),
  }))
}

export function getRoutesByCategory(): Record<string, RouteItem[]> {
  const routes = generateRoutes()
  
  return {
    core: routes.filter(r => ['/', '/admin', '/playground'].includes(r.path)),
    blog: routes.filter(r => r.path.startsWith('/blog')),
    dev: routes.filter(r => r.path.startsWith('/dev')),
    legal: routes.filter(r => ['/privacy', '/terms'].includes(r.path)),
  }
}

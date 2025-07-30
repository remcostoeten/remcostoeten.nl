import { A, useLocation } from "@solidjs/router"
import { JSX, Show, For, createMemo } from "solid-js"

type TProps = {
  readonly children: JSX.Element
  readonly "show-nav"?: boolean
}

type TNav = {
  readonly href: string
  readonly children: JSX.Element
  readonly class?: string
}

type TItem = {
  href: string
  label: string
  order?: number
}

const ROUTE_CONFIG = {
  exclude: [
    "/[...404]",
    "/api/*",
    "/auth/register",
    "/tailwind-demo",
  ],
  customLabels: {
    "/": { label: "Home", order: 1 },
    "/about": { label: "About", order: 2 },
    "/projects": { label: "Projects", order: 3 },
    "/contact": { label: "Contact", order: 4 },
    "/analytics": { label: "Analytics", order: 5 },
    "/auth/login": { label: "Login", order: 10 },
  }
}

function getStaticRoutes(): TItem[] {
  return Object.entries(ROUTE_CONFIG.customLabels).map(([href, config]) => ({
    href,
    label: config.label,
    order: config.order
  })).sort((a, b) =>
    a.order !== b.order ? (a.order || 0) - (b.order || 0) : a.label.localeCompare(b.label)
  )
}

function generateLabelFromPath(routePath: string): string {
  if (routePath === "/") return "Home"

  return routePath
    .split("/")
    .filter(Boolean)
    .map(segment => {
      if (segment.startsWith(":")) return segment.slice(1)
      return segment
        .split("-")
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ")
    })
    .join(" / ")
}

const NAV_ITEMS: TItem[] = getStaticRoutes()

function NavLink(props: TNav) {
  const location = useLocation()

  const isActive = createMemo(() => {
    const currentPath = location.pathname
    const linkPath = props.href
    if (linkPath === "/") return currentPath === "/"
    return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`)
  })

  const computedClass = createMemo(() => {
    const base = "link-underline inline font-medium no-underline transition-all duration-300 ease-out"
    const state = isActive()
      ? "text-accent"
      : "text-muted-foreground hover:text-foreground"
    const extra = props.class ? ` ${props.class}` : ""
    return `${base} ${state}${extra}`
  })

  return (
    <A href={props.href} class={computedClass()}>
      {props.children}
    </A>
  )
}

function Navigation() {
  return (
    <nav class="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div class="container-centered">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <A href="/" class="text-xl font-medium text-foreground hover:text-accent transition-colors">
              Remco Stoeten
            </A>
          </div>
          <div class="flex items-center gap-6">
            <For each={NAV_ITEMS}>
              {item => <NavLink href={item.href}>{item.label}</NavLink>}
            </For>
          </div>
        </div>
      </div>
    </nav>
  )
}

function BaseLayout(props: TProps) {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <Show when={props["show-nav"] !== false}>
        <Navigation />
      </Show>
      <main class="flex-1">{props.children}</main>
    </div>
  )
}

function refreshRoutes(): TItem[] {
  return getStaticRoutes()
}

export { BaseLayout, NavLink, Navigation, NAV_ITEMS, refreshRoutes }

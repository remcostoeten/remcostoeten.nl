import { JSX, Show } from 'solid-js'
import { A, useLocation } from '@solidjs/router'

type TBaseLayoutProps = {
  readonly children: JSX.Element
  readonly title?: string
  readonly 'show-nav'?: boolean
}

type TNavLinkProps = {
  readonly href: string
  readonly children: JSX.Element
  readonly class?: string
}

function NavLink(props: TNavLinkProps) {
  const location = useLocation()
  const isActive = () => location.pathname === props.href
  
  return (
    <A 
      href={props.href}
      class={`theme-link ${
        isActive() 
          ? 'text-accent font-medium' 
          : 'text-muted-foreground hover:text-foreground'
      } transition-colors ${props.class || ''}`}
    >
      {props.children}
    </A>
  )
}

function BaseLayout(props: TBaseLayoutProps) {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <Show when={props['show-nav'] !== false}>
        <nav class="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div class="container-centered">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center">
                <A href="/" class="text-xl font-medium text-foreground hover:text-accent transition-colors">
                  Remco Stoeten
                </A>
              </div>
              
              <div class="flex items-center gap-6">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/projects">Projects</NavLink>
                <NavLink href="/contact">Contact</NavLink>
                <NavLink href="/analytics">Analytics</NavLink>
                <NavLink 
                  href="/admin" 
                  class="px-3 py-1.5 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-colors"
                >
                  Admin
                </NavLink>
              </div>
            </div>
          </div>
        </nav>
      </Show>
      
      <main class="flex-1">
        {props.children}
      </main>
      
      <footer class="border-t border-border bg-card/50 mt-auto">
        <div class="container-centered">
          <div class="text-center text-muted-foreground text-sm py-6">
            © {new Date().getFullYear()} Remco Stoeten. Built with SolidStart.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BaseLayout

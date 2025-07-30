import { JSX } from 'solid-js'
import { getCardClasses } from '~/lib/style-utils'

type TProps = {
  readonly variant?: "default" | "muted" | "accent"
  readonly class?: string
  readonly children: JSX.Element
}

function Card(props: TProps) {
  function classes() {
    const baseClasses = getCardClasses(props.variant)
    return props.class ? `${baseClasses} ${props.class}` : baseClasses
  }

  return (
    <div class={classes()}>
      {props.children}
    </div>
  )
}

function CardHeader(props: { readonly children: JSX.Element; readonly class?: string }) {
  function classes() {
    return props.class ? `p-6 ${props.class}` : "p-6"
  }
  
  return (
    <div class={classes()}>
      {props.children}
    </div>
  )
}

function CardContent(props: { readonly children: JSX.Element; readonly class?: string }) {
  function classes() {
    return props.class ? `p-6 pt-0 ${props.class}` : "p-6 pt-0"
  }
  
  return (
    <div class={classes()}>
      {props.children}
    </div>
  )
}

function CardTitle(props: { readonly children: JSX.Element; readonly class?: string }) {
  function classes() {
    return props.class ? `text-xl font-semibold leading-none tracking-tight ${props.class}` : "text-xl font-semibold leading-none tracking-tight"
  }
  
  return (
    <h3 class={classes()}>
      {props.children}
    </h3>
  )
}

function CardDescription(props: { readonly children: JSX.Element; readonly class?: string }) {
  function classes() {
    return props.class ? `text-sm text-muted-foreground ${props.class}` : "text-sm text-muted-foreground"
  }
  
  return (
    <p class={classes()}>
      {props.children}
    </p>
  )
}

export { Card, CardHeader, CardContent, CardTitle, CardDescription }

import { JSX } from 'solid-js'
import { getBadgeClasses } from '~/lib/style-utils'

type TProps = {
  readonly variant?: "default" | "secondary" | "accent" | "destructive"
  readonly class?: string
  readonly children: JSX.Element
}

function Badge(props: TProps) {
  function classes() {
    const baseClasses = getBadgeClasses(props.variant)
    return props.class ? `${baseClasses} ${props.class}` : baseClasses
  }

  return (
    <div class={classes()}>
      {props.children}
    </div>
  )
}

export { Badge }

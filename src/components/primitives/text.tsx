import { JSX, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

type TTextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
type TTextVariant = 'hero' | 'body' | 'highlight' | 'caption' | 'quote'
type TTextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

type TProps = {
  readonly as?: TTextElement
  readonly variant?: TTextVariant
  readonly size?: TTextSize
  readonly class?: string
  readonly children: JSX.Element
}

function getTextClasses(variant: TTextVariant = 'body', size?: TTextSize): string {
  const variants = {
    hero: 'text-xl font-medium text-foreground',
    body: 'text-foreground leading-relaxed text-base',
    highlight: 'highlight',
    caption: 'text-sm text-muted-foreground',
    quote: 'text-lg italic text-muted-foreground border-l-4 border-border pl-4'
  }

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm', 
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  }

  const baseClasses = variants[variant]
  const sizeClass = size ? sizes[size] : ''
  
  return sizeClass ? `${baseClasses} ${sizeClass}` : baseClasses
}

function Text(props: TProps) {
  const [local, others] = splitProps(props, [
    'as', 'variant', 'size', 'class', 'children'
  ])

  function element() {
    return local.as ?? 'p'
  }

  function variant() {
    return local.variant ?? 'body'
  }

  function classes() {
    const baseClasses = getTextClasses(variant(), local.size)
    return local.class ? `${baseClasses} ${local.class}` : baseClasses
  }

  return (
    <Dynamic 
      component={element()}
      class={classes()}
      {...others}
    >
      {local.children}
    </Dynamic>
  )
}

export { Text }

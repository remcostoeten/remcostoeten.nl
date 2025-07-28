import { JSX, Component, splitProps } from 'solid-js'
import { getButtonClasses } from '~/lib/style-utils'

type TButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outlined' | 'link' | 'admin'
type TButtonSize = 'sm' | 'md' | 'lg'

type TProps = {
  readonly variant?: TButtonVariant
  readonly size?: TButtonSize
  readonly disabled?: boolean
  readonly loading?: boolean
  readonly children: JSX.Element
  readonly class?: string
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

function Button(props: TProps) {
  const [local, others] = splitProps(props, [
    'variant', 'size', 'disabled', 'loading', 'children', 'class'
  ])

  function variant() {
    return local.variant ?? 'primary'
  }
  
  function size() {
    return local.size ?? 'md'
  }
  
  function isDisabled() {
    return local.disabled || local.loading
  }

  function classes() {
    const baseClasses = getButtonClasses(variant(), size())
    return local.class ? `${baseClasses} ${local.class}` : baseClasses
  }

  return (
    <button
      class={classes()}
      disabled={isDisabled()}
      {...others}
    >
      {local.loading && (
        <svg 
          class="-ml-1 mr-2 h-4 w-4 animate-spin" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            class="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          />
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {local.children}
    </button>
  )
}

export { Button }

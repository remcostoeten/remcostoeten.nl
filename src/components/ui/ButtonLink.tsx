import { JSX, splitProps } from 'solid-js'
import { getButtonClasses } from '~/lib/style-utils'

type TButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outlined' | 'link' | 'admin'
type TButtonSize = 'sm' | 'md' | 'lg'

type TProps = {
  readonly variant?: TButtonVariant
  readonly size?: TButtonSize
  readonly loading?: boolean
  readonly disabled?: boolean
  readonly class?: string
  readonly children: JSX.Element
  readonly href?: string
} & JSX.ButtonHTMLAttributes<HTMLButtonElement> & JSX.AnchorHTMLAttributes<HTMLAnchorElement>

function ButtonLink(props: TProps) {
  const [local, others] = splitProps(props, [
    'variant', 'size', 'disabled', 'loading', 'children', 'class', 'href'
  ])

  function variant() {
    return local.variant ?? 'admin'
  }
  
  function size() {
    return local.size ?? 'md'
  }
  
  function isDisabled() {
    return local.disabled || local.loading
  }
  
  const elementTag = local.href ? 'a' : 'button'

  function classes() {
    const baseClasses = getButtonClasses(variant(), size())
    return local.class ? `${baseClasses} ${local.class}` : baseClasses
  }

  function handleClick(e: MouseEvent) {
    if (isDisabled()) {
      e.preventDefault()
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (isDisabled()) {
      return
    }
    
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      const target = e.currentTarget as HTMLAnchorElement
      target.click()
    }
  }

  function getAnchorButtonAttributes() {
    return {
      role: 'button',
      onKeyDown: handleKeyDown,
      'aria-disabled': isDisabled(),
      tabIndex: isDisabled() ? -1 : 0
    }
  }

  if (elementTag === 'a') {
    return (
      <a
        class={classes()}
        href={local.href}
        onClick={handleClick}
        {...getAnchorButtonAttributes()}
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
      </a>
    )
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

export { ButtonLink }

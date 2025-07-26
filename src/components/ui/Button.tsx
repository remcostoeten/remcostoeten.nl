import { JSX, Component, splitProps } from 'solid-js'

type TButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type TButtonSize = 'sm' | 'md' | 'lg'

type TButtonProps = {
  readonly variant?: TButtonVariant
  readonly size?: TButtonSize
  readonly disabled?: boolean
  readonly loading?: boolean
  readonly children: JSX.Element
  readonly class?: string
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

const getVariantClasses = (variant: TButtonVariant): string => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  }
  return variants[variant]
}

const getSizeClasses = (size: TButtonSize): string => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  return sizes[size]
}

const Button: Component<TButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant', 'size', 'disabled', 'loading', 'children', 'class'
  ])

  const variant = () => local.variant ?? 'primary'
  const size = () => local.size ?? 'md'
  const isDisabled = () => local.disabled || local.loading

  const classes = () => [
    'inline-flex items-center justify-center',
    'font-medium rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    getVariantClasses(variant()),
    getSizeClasses(size()),
    local.class
  ].filter(Boolean).join(' ')

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

export default Button

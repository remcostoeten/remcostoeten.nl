import { JSX, Component, splitProps, Show } from 'solid-js'

type TInputProps = {
  readonly label?: string
  readonly error?: string
  readonly helperText?: string
  readonly required?: boolean
  readonly class?: string
} & JSX.InputHTMLAttributes<HTMLInputElement>

const Input: Component<TInputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label', 'error', 'helperText', 'required', 'class'
  ])

  const inputClasses = () => [
    'block w-full px-3 py-2 border rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'transition-colors duration-200',
    local.error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500',
    local.class
  ].filter(Boolean).join(' ')

  return (
    <div class="space-y-1">
      <Show when={local.label}>
        <label class="block text-sm font-medium text-gray-700">
          {local.label}
          {local.required && <span class="text-red-500 ml-1">*</span>}
        </label>
      </Show>
      
      <input
        class={inputClasses()}
        required={local.required}
        {...others}
      />
      
      <Show when={local.error}>
        <p class="text-sm text-red-600">{local.error}</p>
      </Show>
      
      <Show when={local.helperText && !local.error}>
        <p class="text-sm text-gray-500">{local.helperText}</p>
      </Show>
    </div>
  )
}

export default Input

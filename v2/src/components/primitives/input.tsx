import { JSX, splitProps, Show } from 'solid-js'
import { getInputClasses } from '~/utilities'

type TProps = {
  readonly label?: string
  readonly error?: string
  readonly helperText?: string
  readonly success?: boolean
  readonly required?: boolean
  readonly class?: string
} & JSX.InputHTMLAttributes<HTMLInputElement>

function Input(props: TProps) {
  const [local, others] = splitProps(props, [
    'label', 'error', 'helperText', 'success', 'required', 'class'
  ])

  function inputClasses() {
    const state = local.error ? 'error' : local.success ? 'success' : 'default'
    const baseClasses = getInputClasses(state)
    return local.class ? `${baseClasses} ${local.class}` : baseClasses
  }

  return (
    <div class="space-y-1">
      <Show when={local.label}>
        <label class="block text-sm font-medium text-foreground">
          {local.label}
          {local.required && <span class="text-destructive ml-1">*</span>}
        </label>
      </Show>
      
      <input
        class={inputClasses()}
        required={local.required}
        {...others}
      />
      
      <Show when={local.error}>
        <p class="text-sm text-destructive error-animate">{local.error}</p>
      </Show>
      
      <Show when={local.helperText && !local.error}>
        <p class="text-sm text-muted-foreground">{local.helperText}</p>
      </Show>
    </div>
  )
}

export { Input }


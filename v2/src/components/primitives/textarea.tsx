import { JSX, splitProps, Show, createSignal, createEffect, createUniqueId } from 'solid-js'
import { getTextareaClasses } from '~/utilities'
import '~/styles/error-animation.css' 

type TProps = {
  readonly label?: string
  readonly error?: string
  readonly helperText?: string
  readonly success?: boolean
  readonly required?: boolean
  readonly class?: string
  readonly autosize?: boolean
  readonly minRows?: number
  readonly maxLength?: number
  readonly resize?: 'none' | 'vertical' | 'both'
} & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>

function Textarea(props: TProps) {
  const [local, others] = splitProps(props, [
    'label', 'error', 'helperText', 'success', 'required', 'class', 
    'autosize', 'minRows', 'maxLength', 'resize', 'id'
  ])

  const [characterCount, setCharacterCount] = createSignal(0)
  const [textareaRef, setTextareaRef] = createSignal<HTMLTextAreaElement>()
  const uniqueId = createUniqueId()
  const textareaId = local.id || uniqueId
  const describedById = `${textareaId}-description`

  function textareaClasses() {
    const state = local.error ? 'error' : local.success ? 'success' : 'default'
    const baseClasses = getTextareaClasses(state)
    return local.class ? `${baseClasses} ${local.class}` : baseClasses
  }

  function textareaStyle() {
    const resize = local.resize || 'vertical'
    const baseStyle = { resize }
    
    if (local.autosize && local.minRows) {
      const lineHeight = 1.5
      const padding = 16
      const minHeight = local.minRows * lineHeight * 16 + padding
      return { ...baseStyle, minHeight: `${minHeight}px` }
    }
    
    return baseStyle
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement
    const value = target.value
    
    setCharacterCount(value.length)
    
    if (local.autosize) {
      target.style.height = 'auto'
      target.style.height = `${target.scrollHeight}px`
    }
    
    if (others.onInput) {
      others.onInput(event as InputEvent & {
        currentTarget: HTMLTextAreaElement
        target: HTMLTextAreaElement
      })
    }
  }

  createEffect(() => {
    const textarea = textareaRef()
    if (textarea && others.value !== undefined) {
      const value = String(others.value || '')
      setCharacterCount(value.length)
      
      if (local.autosize) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }
  })

  return (
    <div class="space-y-1">
      <Show when={local.label}>
        <label 
          for={textareaId}
          class="block text-sm font-medium text-foreground"
        >
          {local.label}
          {local.required && <span class="text-destructive ml-1">*</span>}
        </label>
      </Show>
      
      <textarea
        ref={setTextareaRef}
        id={textareaId}
        class={textareaClasses()}
        style={textareaStyle()}
        required={local.required}
        maxLength={local.maxLength}
        aria-invalid={!!local.error}
        aria-describedby={local.error || local.helperText || local.maxLength ? describedById : undefined}
        onInput={handleInput}
        {...others}
      />
      
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <Show when={local.error}>
            <p id={describedById} class="text-sm text-destructive error-animate">{local.error}</p>
          </Show>
          
          <Show when={local.helperText && !local.error}>
            <p id={describedById} class="text-sm text-muted-foreground">{local.helperText}</p>
          </Show>
        </div>
        
        <Show when={local.maxLength}>
          <div class="text-sm text-muted-foreground ml-2 shrink-0">
            {characterCount()}/{local.maxLength}
          </div>
        </Show>
      </div>
    </div>
  )
}

export { Textarea }


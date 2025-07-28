import { JSX, splitProps } from 'solid-js'
import { Motion } from '@motionone/solid'

type TProps = {
  readonly href: string
  readonly children: JSX.Element
  readonly external?: boolean
  readonly class?: string
} & JSX.AnchorHTMLAttributes<HTMLAnchorElement>

function ArrowLink(props: TProps) {
  const [local, others] = splitProps(props, [
    'href', 'children', 'external', 'class'
  ])

  const isExternal = local.external || local.href.startsWith('http')

  function classes() {
    return `
      relative inline-flex items-center gap-1
      text-accent font-medium
      transition-all duration-300 ease-out
      hover:text-accent
      group
      ${local.class || ''}
    `.trim()
  }

  return (
    <Motion.a
      href={local.href}
      class={classes()}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 1 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, easing: [0.4, 0, 0.2, 1] }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      {...others}
    >
      {/* Animated underline */}
      <Motion.span
        class="absolute bottom-0 left-0 h-px bg-gradient-to-r from-accent via-accent to-transparent"
        initial={{ scaleX: 0, transformOrigin: 'left' }}
        whileHover={{ 
          scaleX: 1,
          transition: { duration: 0.28, easing: [0.23, 1, 0.32, 1] }
        }}
        style={{ 
          width: isExternal ? 'calc(100% - 1.5rem)' : '100%'
        }}
      />
      
      <span class="relative z-10">
        {local.children}
      </span>
      
      {isExternal && (
        <Motion.span
          class="relative z-10 text-accent opacity-80 transition-all duration-200"
          initial={{ rotate: 0, scale: 1 }}
          whileHover={{ 
            rotate: 15,
            scale: 1.1,
            transition: { duration: 0.2, easing: [0.4, 0, 0.2, 1] }
          }}
        >
          ↗
        </Motion.span>
      )}
    </Motion.a>
  )
}

export { ArrowLink }

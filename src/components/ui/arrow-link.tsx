import { JSX, splitProps, createMemo } from 'solid-js'

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

  const classes = createMemo(() => {
    return `
      link-underline ${isExternal ? 'with-arrow' : ''}
      inline-flex items-center gap-1
      text-accent font-medium no-underline
      transition-all duration-300 ease-out
      hover:text-accent
      group
      ${local.class || ''}
    `.trim()
  })

  return (
    <a
      href={local.href}
      class={classes()}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...others}
    >

      
      <span class="relative z-10">
        {local.children}
      </span>
      
      {isExternal && (
        <span
          class="relative z-10 text-accent opacity-80 transition-all duration-200 group-hover:rotate-15 group-hover:scale-110"
        >
          ↗
        </span>
      )}
    </a>
  )
}

export { ArrowLink }

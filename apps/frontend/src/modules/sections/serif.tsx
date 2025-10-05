import { cn } from '@/lib/utils'

type TProps = {
  className?: string
  i?: boolean
  children: React.ReactNode
}

/**
 * A component that renders a span with font-serif and optionally configurable via props to become italic
 * @param children - The content to render inside the span
 * @param i - Whether to apply italic styling
 * @example
 * <S>text</S>
 * @example
 * <S i>Text</S>
 */
export function S({ className, children, i = false }: TProps) {
  return (
    <span className={cn('font-serif', { italic: i }, className)}>
      {children}
    </span>
  )
}

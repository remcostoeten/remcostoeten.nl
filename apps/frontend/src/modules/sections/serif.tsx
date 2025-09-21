import React from 'react'

type TProps = {
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
export function S({ children, i = false }: TProps) {
  const className = i ? 'font-serif italic' : 'font-serif'
  
  return (
    <span className={className}>
      {children}
    </span>
  )
}
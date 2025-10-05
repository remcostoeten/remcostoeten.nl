import { cn } from '@/lib/utils'

type TProps = {
  className?: string
  i?: boolean
  color?: 'default' | 'accent' | 'muted' | 'primary'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  children: React.ReactNode
}

export function S({
  className,
  children,
  i = false,
  color = 'default',
  size = 'base',
  weight = 'normal'
}: TProps) {
  const colorClasses = {
    default: 'text-foreground',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
    primary: 'text-primary'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <span className={cn(
      'font-serif',
      colorClasses[color],
      sizeClasses[size],
      weightClasses[weight],
      { italic: i },
      className
    )}>
      {children}
    </span>
  )
}
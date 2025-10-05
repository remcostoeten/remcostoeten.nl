import { cn } from '@/lib/utils';

type TProps = {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg'
};

const sizeClasses: Record<NonNullable<TProps['size']>, string> = {
  sm: 'text-[16px]',
  md: 'text-[16px]',
  lg: 'text-[20px]',
};

export function Paragraph({ children, className, size = 'sm' }: TProps) {
  return (
    <p className={cn(sizeClasses[size], className)}>
      {children}
    </p>
  );
}

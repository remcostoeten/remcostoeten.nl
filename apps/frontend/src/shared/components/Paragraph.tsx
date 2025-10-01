import { cn } from '@/lib/utils';
import React from 'react';

type TProps = {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md'
};

const sizeClasses: Record<NonNullable<TProps['size']>, string> = {
  sm: 'text-[16px]',
  md: 'text-[18px]',
};

export function Paragraph({ children, className, size = 'sm' }: TProps) {
  return (
    <p className={cn(sizeClasses[size], className)}>
      {children}
    </p>
  );
}

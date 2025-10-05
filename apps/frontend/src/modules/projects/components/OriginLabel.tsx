'use client';

import Link from 'next/link';
import { TOriginLabel } from '../types';

type OriginLabelProps = {
  label: TOriginLabel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  blogUrl?: string;
};

export function OriginLabel({ label, size = 'sm', className = '', blogUrl }: OriginLabelProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'lg':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-2.5 py-1.5 text-xs';
      case 'sm':
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  const getOriginLabelStyles = (color?: string) => {
    switch (color) {
      case 'website':
        return 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent border-accent/30 shadow-accent/20';
      case 'community':
        return 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 border-blue-500/30 shadow-blue-500/20';
      case 'personal':
        return 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-600 border-green-500/30 shadow-green-500/20';
      case 'client':
        return 'bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-600 border-purple-500/30 shadow-purple-500/20';
      case 'blog':
        return 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-600 border-orange-500/30 shadow-orange-500/20 hover:from-orange-500/30 hover:to-orange-500/20 hover:text-orange-700';
      default:
        return 'bg-gradient-to-r from-muted/20 to-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const content = (
    <>
      {label.icon && <span className="mr-1">{label.icon}</span>}
      {label.text}
    </>
  );

  const spanClasses = `${getSizeClasses(size)} font-medium border rounded-full shadow-sm transition-all duration-200 ${getOriginLabelStyles(label.color)} ${blogUrl ? 'cursor-pointer hover:scale-105' : ''} ${className}`;

  if (blogUrl) {
    return (
      <Link
        href={blogUrl}
        className={spanClasses}
        title={label.description || `Read blog post about ${label.text}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      className={spanClasses}
      title={label.description}
    >
      {content}
    </span>
  );
}
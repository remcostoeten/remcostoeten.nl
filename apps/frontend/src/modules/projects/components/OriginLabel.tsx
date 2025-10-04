'use client';

import { TOriginLabel } from '../types';

type OriginLabelProps = {
  label: TOriginLabel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function OriginLabel({ label, size = 'sm', className = '' }: OriginLabelProps) {
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
      default:
        return 'bg-gradient-to-r from-muted/20 to-muted/10 text-muted-foreground border-muted/30';
    }
  };

  return (
    <span 
      className={`${getSizeClasses(size)} font-medium border rounded-full shadow-sm ${getOriginLabelStyles(label.color)} ${className}`}
      title={label.description}
    >
      {label.icon && <span className="mr-1">{label.icon}</span>}
      {label.text}
    </span>
  );
}
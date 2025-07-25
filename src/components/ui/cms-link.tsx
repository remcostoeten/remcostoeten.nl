import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type TLinkVariant = 
  | 'default' 
  | 'primary' 
  | 'muted' 
  | 'ghost' 
  | 'outline' 
  | 'destructive'
  | 'accent';

type TLinkSize = 'sm' | 'md' | 'lg';

type TIndicatorVariant = 
  | 'none'
  | 'arrow-left' 
  | 'arrow-right'
  | 'external'
  | 'new-tab'
  | 'dot'
  | 'pulse'
  | 'badge';

type TIconPosition = 'left' | 'right' | 'none';

type TProps = {
  href: string;
  children: React.ReactNode;
  variant?: TLinkVariant;
  size?: TLinkSize;
  icon?: LucideIcon;
  iconPosition?: TIconPosition;
  indicator?: TIndicatorVariant;
  indicatorText?: string;
  showHoverEffect?: boolean;
  isActive?: boolean;
  isExternal?: boolean;
  className?: string;
  target?: string;
  rel?: string;
  'aria-label'?: string;
};

function getLinkClasses(variant: TLinkVariant, size: TLinkSize, isActive?: boolean): string {
  const baseClasses = "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  // Size classes
  const sizeClasses = {
    sm: "text-sm gap-1.5",
    md: "text-base gap-2", 
    lg: "text-lg gap-2.5"
  };

  // Variant classes
  const variantClasses = {
    default: isActive 
      ? "text-foreground font-medium" 
      : "text-muted-foreground hover:text-foreground",
    primary: isActive
      ? "text-primary font-medium"
      : "text-primary hover:text-primary/80",
    muted: isActive
      ? "text-muted-foreground font-medium"
      : "text-muted-foreground hover:text-primary",
    ghost: isActive
      ? "bg-accent text-accent-foreground font-medium"
      : "hover:bg-accent hover:text-accent-foreground",
    outline: isActive
      ? "border border-primary text-primary font-medium"
      : "border border-input hover:bg-accent hover:text-accent-foreground",
    destructive: isActive
      ? "text-destructive font-medium"
      : "text-destructive hover:text-destructive/80",
    accent: isActive
      ? "text-accent-foreground bg-accent font-medium"
      : "text-accent-foreground hover:bg-accent/80"
  };

  return cn(baseClasses, sizeClasses[size], variantClasses[variant]);
}

function getIndicatorElement(indicator: TIndicatorVariant, indicatorText?: string): React.ReactNode {
  switch (indicator) {
    case 'arrow-left':
      return <span className="text-xs">←</span>;
    case 'arrow-right':
      return <span className="text-xs">→</span>;
    case 'external':
      return <span className="text-xs">↗</span>;
    case 'new-tab':
      return <span className="text-xs" title="Opens in new tab">⧉</span>;
    case 'dot':
      return <div className="w-1.5 h-1.5 rounded-full bg-current" />;
    case 'pulse':
      return <div className="w-2 h-2 rounded-full bg-current animate-pulse" />;
    case 'badge':
      return indicatorText ? (
        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
          {indicatorText}
        </span>
      ) : null;
    case 'none':
    default:
      return null;
  }
}

function getIconSize(size: TLinkSize): string {
  switch (size) {
    case 'sm': return 'w-3 h-3';
    case 'md': return 'w-4 h-4';
    case 'lg': return 'w-5 h-5';
    default: return 'w-4 h-4';
  }
}

export function CMSLink({
  href,
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconPosition = 'none',
  indicator = 'none',
  indicatorText,
  showHoverEffect = true,
  isActive = false,
  isExternal = false,
  className,
  target,
  rel,
  'aria-label': ariaLabel,
  ...props
}: TProps) {
  const linkClasses = getLinkClasses(variant, size, isActive);
  const iconClasses = getIconSize(size);
  const indicatorElement = getIndicatorElement(indicator, indicatorText);
  
  // Auto-detect external links if not explicitly set
  const isExternalLink = isExternal || href.startsWith('http') || href.startsWith('//');
  
  const linkProps = {
    href,
    className: cn(
      linkClasses,
      showHoverEffect && "transition-all duration-200",
      className
    ),
    'aria-label': ariaLabel,
    ...(isExternalLink && {
      target: target || '_blank',
      rel: rel || 'noopener noreferrer'
    }),
    ...props
  };

  return (
    <a {...linkProps}>
      {/* Left Icon */}
      {Icon && iconPosition === 'left' && (
        <Icon className={iconClasses} />
      )}
      
      {/* Left Indicator */}
      {indicator === 'arrow-left' && indicatorElement}
      
      {/* Main Content */}
      <span>{children}</span>
      
      {/* Right Indicator */}
      {(indicator === 'arrow-right' || indicator === 'external' || indicator === 'new-tab') && indicatorElement}
      
      {/* Right Icon */}
      {Icon && iconPosition === 'right' && (
        <Icon className={iconClasses} />
      )}
      
      {/* Other Indicators */}
      {(indicator === 'dot' || indicator === 'pulse' || indicator === 'badge') && indicatorElement}
    </a>
  );
}

// Export types for CMS configuration
export type {
  TLinkVariant,
  TLinkSize,
  TIndicatorVariant,
  TIconPosition,
  TProps as TCMSLinkProps
};

import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TProps = {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'muted' | 'destructive' | 'secondary' | 'primary';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline' | 'line-through' | 'overline';
  spacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  family?: 'sans' | 'serif' | 'mono';
  gradient?: boolean;
  glow?: boolean;
  highlight?: boolean;
  truncate?: boolean;
  italic?: boolean;
  animate?: 'none' | 'pulse' | 'bounce' | 'fade-in' | 'slide-up' | 'shimmer';
  opacity?: 'full' | 'high' | 'medium' | 'low' | 'lower' | 'lowest';
  maxLines?: 1 | 2 | 3 | 4 | 5 | 6;
  href?: string;
  target?: '_blank' | '_self';
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'a' | 'code' | 'pre';
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

export function Text({
  children,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  align = 'left',
  transform = 'none',
  decoration = 'none',
  spacing = 'normal',
  leading = 'normal',
  family = 'sans',
  gradient = false,
  glow = false,
  highlight = false,
  truncate = false,
  italic = false,
  animate = 'none',
  opacity = 'full',
  maxLines,
  href,
  target = '_self',
  as = 'span',
  className,
  ...props
}: TProps) {
  function getVariantClasses() {
    switch (variant) {
      case 'accent':
        return 'text-accent';
      case 'muted':
        return 'text-muted-foreground';
      case 'destructive':
        return 'text-destructive';
      case 'secondary':
        return 'text-secondary-foreground';
      case 'primary':
        return 'text-primary';
      default:
        return 'text-foreground';
    }
  }

  function getSizeClasses() {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'base':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case '2xl':
        return 'text-2xl';
      case '3xl':
        return 'text-3xl';
      case '4xl':
        return 'text-4xl';
      case '5xl':
        return 'text-5xl';
      case '6xl':
        return 'text-6xl';
      default:
        return 'text-base';
    }
  }

  function getWeightClasses() {
    switch (weight) {
      case 'light':
        return 'font-light';
      case 'normal':
        return 'font-normal';
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      case 'extrabold':
        return 'font-extrabold';
      default:
        return 'font-normal';
    }
  }

  function getAlignClasses() {
    switch (align) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      default:
        return 'text-left';
    }
  }

  function getTransformClasses() {
    switch (transform) {
      case 'uppercase':
        return 'uppercase';
      case 'lowercase':
        return 'lowercase';
      case 'capitalize':
        return 'capitalize';
      default:
        return '';
    }
  }

  function getDecorationClasses() {
    switch (decoration) {
      case 'underline':
        return 'underline';
      case 'line-through':
        return 'line-through';
      case 'overline':
        return 'overline';
      default:
        return '';
    }
  }

  function getSpacingClasses() {
    switch (spacing) {
      case 'tighter':
        return 'tracking-tighter';
      case 'tight':
        return 'tracking-tight';
      case 'normal':
        return 'tracking-normal';
      case 'wide':
        return 'tracking-wide';
      case 'wider':
        return 'tracking-wider';
      case 'widest':
        return 'tracking-widest';
      default:
        return 'tracking-normal';
    }
  }

  function getLeadingClasses() {
    switch (leading) {
      case 'none':
        return 'leading-none';
      case 'tight':
        return 'leading-tight';
      case 'snug':
        return 'leading-snug';
      case 'normal':
        return 'leading-normal';
      case 'relaxed':
        return 'leading-relaxed';
      case 'loose':
        return 'leading-loose';
      default:
        return 'leading-normal';
    }
  }

  function getFamilyClasses() {
    switch (family) {
      case 'sans':
        return 'font-sans';
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  }

  function getAnimationClasses() {
    switch (animate) {
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'fade-in':
        return 'animate-fadeInUp';
      case 'slide-up':
        return 'animate-fadeInUp';
      case 'shimmer':
        return 'animate-shimmer';
      default:
        return '';
    }
  }

  function getOpacityClasses() {
    switch (opacity) {
      case 'full':
        return 'opacity-100';
      case 'high':
        return 'opacity-90';
      case 'medium':
        return 'opacity-75';
      case 'low':
        return 'opacity-50';
      case 'lower':
        return 'opacity-25';
      case 'lowest':
        return 'opacity-10';
      default:
        return 'opacity-100';
    }
  }

  function getMaxLinesClasses() {
    if (!maxLines) return '';
    return `line-clamp-${maxLines}`;
  }

  function getSpecialEffectClasses() {
    const effects = [];
    
    if (gradient) {
      effects.push('bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent');
    }
    
    if (glow) {
      effects.push('drop-shadow-[0_0_8px_hsl(var(--accent))]');
    }
    
    if (highlight) {
      effects.push('bg-accent/20 px-1 rounded-sm border-l-2 border-accent');
    }
    
    if (truncate) {
      effects.push('truncate');
    }
    
    if (italic) {
      effects.push('italic');
    }
    
    return effects.join(' ');
  }

  const baseClasses = cn(
    'transition-all duration-200',
    getVariantClasses(),
    getSizeClasses(),
    getWeightClasses(),
    getAlignClasses(),
    getTransformClasses(),
    getDecorationClasses(),
    getSpacingClasses(),
    getLeadingClasses(),
    getFamilyClasses(),
    getAnimationClasses(),
    getOpacityClasses(),
    getMaxLinesClasses(),
    getSpecialEffectClasses(),
    className
  );

  const Component = href ? 'a' : as;
  
  const linkProps = href ? {
    href,
    target,
    rel: target === '_blank' ? 'noopener noreferrer' : undefined
  } : {};

  return (
    <Component 
      className={baseClasses}
      {...linkProps}
      {...props}
    >
      {children}
    </Component>
  );
}

'use client';

import { Link } from "./link";

type TProps = {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
};

/**
 * A clickable accent link with dotted border and hover effects
 * @param children - The content to render inside the link
 * @param href - Optional URL to link to. If not provided, renders as a clickable span
 * @param external - Whether the link is external (auto-detected if href starts with http)
 * @param onClick - Optional click handler
 * @param className - Additional CSS classes
 * @example
 * <AccentLink href="/design">Product Design</AccentLink>
 * <AccentLink href="https://example.com" external>External Link</AccentLink>
 * <AccentLink onClick={() => console.log('clicked')}>Clickable Text</AccentLink>
 */
export function AccentLink({ children, href, external, onClick, className }: TProps) {
  const baseClasses = "text-accent hover:underline font-medium hover:no-underline cursor-pointer border-2 border-dotted border-accent/30 hover:border-accent/60 px-1 rounded transition-colors duration-200";
  
  if (href) {
    return (
      <Link 
        href={href} 
        external={external}
        className={`${baseClasses} ${className || ''}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <span 
      className={`${baseClasses} ${className || ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as any);
        }
      } : undefined}
    >
      {children}
    </span>
  );
}

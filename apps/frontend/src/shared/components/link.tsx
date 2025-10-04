'use client';

import * as React from "react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "../../components/ui/button";

/**
 * Base props that extend Next.js LinkProps while omitting the 'as' prop
 * to avoid conflicts with our custom 'as' prop for styling variants.
 */
interface BaseLinkProps extends Omit<NextLinkProps, 'as'> {
  /** Additional CSS classes to apply */
  className?: string;
  /** Child elements to render inside the link */
  children?: React.ReactNode;
  /** Whether this is an external link (auto-detected from href starting with http/https) */
  external?: boolean;
  /** Whether to show an external link icon for external links */
  showExternalIcon?: boolean;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Props for rendering the link as a button-style component
 */
interface LinkAsButton extends BaseLinkProps {
  /** Must be 'button' to render as button-style */
  as: 'button';
  /** Button variant (from button component) */
  variant?: VariantProps<typeof buttonVariants>['variant'];
  /** Button size (from button component) */
  size?: VariantProps<typeof buttonVariants>['size'];
}

/**
 * Props for rendering the link as a regular text link
 */
interface LinkAsLink extends BaseLinkProps {
  /** Render as link (default) or omit for link-style */
  as?: 'link' | never;
  /** Link text variant */
  variant?: VariantProps<typeof linkVariants>['variant'];
  /** Link text size */
  size?: VariantProps<typeof linkVariants>['size'];
}

/**
 * Variant styles for the Link component using class-variance-authority (cva).
 *
 * @example
 * ```tsx
 * // Using variants directly (advanced usage)
 * <div className={linkVariants({ variant: "accent", size: "lg" })}>
 *   Custom styled content
 * </div>
 * ```
 */
const linkVariants = cva(
  "inline-flex items-center gap-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
  {
    variants: {
      /** Visual style variants for the link */
      variant: {
        /** Default muted style with accent hover color */
        default: "text-muted-foreground hover:text-accent font-medium",
        /** Accent colored text with lighter hover state */
        accent: "text-accent hover:text-accent/80 font-medium",
        /** Underline effect that appears on hover using gradient background */
        underline: "text-muted-foreground hover:text-accent font-medium group relative",
        /** Muted style that becomes more prominent on hover */
        muted: "text-muted-foreground hover:text-foreground",
      },
      /** Size variants affecting text size */
      size: {
        /** Default small text size */
        default: "text-sm",
        /** Extra small text */
        sm: "text-xs",
        /** Large text size */
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface LinkAsButton extends BaseLinkProps {
  /** Must be 'button' to render as button-style */
  as: 'button';
  /** Button variant (from button component) */
  variant?: VariantProps<typeof buttonVariants>['variant'];
  /** Button size (from button component) */
  size?: VariantProps<typeof buttonVariants>['size'];
}

interface LinkAsLink extends BaseLinkProps {
  /** Render as link (default) or omit for link-style */
  as?: 'link' | never;
  /** Link text variant */
  variant?: VariantProps<typeof linkVariants>['variant'];
  /** Link text size */
  size?: VariantProps<typeof linkVariants>['size'];
}

/**
 * Combined type for all possible link configurations
 */
type LinkComponentProps = LinkAsButton | LinkAsLink;

/**
 * Flexible link component that can render as either a Next.js Link or a button-style link.
 *
 * @example
 * ```tsx
 * // Basic internal link
 * <Link href="/about">About</Link>
 *
 * // External link with icon
 * <Link href="https://example.com" external showExternalIcon>
 *   Visit Example
 * </Link>
 *
 * // Button-style link
 * <Link href="/contact" as="button" variant="default" size="lg">
 *   Contact Us
 * </Link>
 *
 * // Underline effect link
 * <Link href="/projects" variant="underline">
 *   View Projects
 * </Link>
 * ```
 */
const Link = React.forwardRef<HTMLAnchorElement, LinkComponentProps>(
  ({ className, children, external, showExternalIcon = false, as, variant, size, ...props }, ref) => {
    const isExternal = external || (typeof props.href === 'string' && props.href.startsWith('http'));
    const shouldShowIcon = showExternalIcon && isExternal;

    const externalProps = isExternal ? {
      target: "_blank",
      rel: "noopener noreferrer",
      'aria-label': shouldShowIcon ? `${children} (opens in new tab)` : undefined,
    } : {};

    const content = (
      <>
        {as === 'button' ? (
          children
        ) : variant === 'underline' ? (
          <span className="relative">
            {children}
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </span>
        ) : (
          children
        )}
        {shouldShowIcon && (
          <ExternalLink
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        )}
      </>
    );

    if (as === 'button') {
      return (
        <NextLink
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...externalProps}
          {...props}
        >
          {content}
        </NextLink>
      );
    }

    return (
      <NextLink
        ref={ref}
        className={cn(linkVariants({ variant, size }), className)}
        {...externalProps}
        {...props}
      >
        {content}
      </NextLink>
    );
  }
);

Link.displayName = "Link";

export { Link, linkVariants };
export type { LinkComponentProps };

/**
 * USAGE EXAMPLES:
 *
 * ## Basic Link Usage
 * ```tsx
 * import { Link } from '@/components/ui/link';
 *
 * // Simple internal navigation
 * <Link href="/about">About Page</Link>
 *
 * // External link (automatically detected)
 * <Link href="https://github.com">GitHub</Link>
 * ```
 *
 * ## External Links with Icons
 * ```tsx
 * // External link with icon
 * <Link href="https://example.com" showExternalIcon>
 *   Visit Example Site
 * </Link>
 *
 * // Explicitly mark as external
 * <Link href="https://docs.example.com" external showExternalIcon>
 *   Documentation
 * </Link>
 * ```
 *
 * ## Button-Style Links
 * ```tsx
 * // Render as a button
 * <Link href="/contact" as="button" variant="default" size="lg">
 *   Contact Us
 * </Link>
 *
 * // Outlined button style
 * <Link href="/signup" as="button" variant="outline" size="sm">
 *   Sign Up
 * </Link>
 * ```
 *
 * ## Styled Text Links
 * ```tsx
 * // Default muted style
 * <Link href="/blog">Read Blog</Link>
 *
 * // Accent colored
 * <Link href="/projects" variant="accent">
 *   View Projects
 * </Link>
 *
 * // Underline effect on hover
 * <Link href="/services" variant="underline">
 *   Our Services
 * </Link>
 * ```
 *
 * ## Different Sizes
 * ```tsx
 * // Small text
 * <Link href="/terms" size="sm">Terms of Service</Link>
 *
 * // Large button
 * <Link href="/get-started" as="button" size="lg">
 *   Get Started
 * </Link>
 * ```
 *
 * ## Advanced Usage with Next.js Features
 * ```tsx
 * // With Next.js prefetching
 * <Link href="/dashboard" prefetch={true}>
 *   Dashboard
 * </Link>
 *
 * // Scroll to specific element
 * <Link href="/about#team" scroll={true}>
 *   Meet the Team
 * </Link>
 *
 * // Replace current history entry
 * <Link href="/new-page" replace>
 *   New Page
 * </Link>
 * ```
 */
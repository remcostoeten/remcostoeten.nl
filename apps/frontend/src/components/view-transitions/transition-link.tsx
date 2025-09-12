"use client";

import Link from 'next/link';
import { useViewTransition } from './use-view-transition';
import { ReactNode, MouseEvent } from 'react';

type TProps = {
  href: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  target?: string;
  rel?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function TransitionLink({ 
  href, 
  children, 
  className, 
  replace = false,
  scroll = true,
  prefetch,
  target,
  rel,
  onClick,
  ...props 
}: TProps) {
  const { navigateWithTransition, replaceWithTransition, isSupported } = useViewTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Don't handle clicks for external links or special keys
    if (target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Don't handle clicks if there's a custom onClick handler
    if (onClick) {
      onClick(event);
      return;
    }

    // Prevent default navigation
    event.preventDefault();

    // Use view transitions for internal navigation
    if (isSupported) {
      if (replace) {
        replaceWithTransition(href);
      } else {
        navigateWithTransition(href);
      }
    } else {
      // Fallback for browsers without view transitions
      if (replace) {
        window.location.replace(href);
      } else {
        window.location.href = href;
      }
    }
  }

  return (
    <Link
      href={href}
      className={className}
      replace={replace}
      scroll={scroll}
      prefetch={prefetch}
      target={target}
      rel={rel}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}

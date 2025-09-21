'use client';

/**
 * Animation Components
 * 
 * Reusable animation wrapper components
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createAnimationConfig, 
  createStaggeredConfig, 
  createContainerConfig,
  createViewTransition
} from './animation-system';

// Sequential animation wrapper
interface SequentialAnimationProps {
  children: React.ReactNode;
  variant?: 'fadeInUp' | 'fadeInLeft' | 'scaleIn';
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const SequentialAnimation: React.FC<SequentialAnimationProps> = ({
  children,
  variant = 'fadeInUp',
  delay,
  className,
  as: Component = 'div'
}) => {
  const config = createAnimationConfig(variant, delay);
  const MotionComponent = motion[Component as keyof typeof motion] as any;
  
  return (
    <MotionComponent
      className={className}
      {...config}
    >
      {children}
    </MotionComponent>
  );
};

// Staggered list wrapper
interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  as?: keyof JSX.IntrinsicElements;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 0.05,
  delayChildren = 0.1,
  as: Component = 'div'
}) => {
  const containerConfig = createContainerConfig(staggerDelay, delayChildren);
  const MotionComponent = motion[Component as keyof typeof motion] as any;
  
  return (
    <MotionComponent
      className={className}
      {...containerConfig}
    >
      {children}
    </MotionComponent>
  );
};

// Staggered list item
interface StaggeredItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  variant?: 'listItem' | 'fadeInUp';
  customIncrement?: number;
  as?: keyof JSX.IntrinsicElements;
}

export const StaggeredItem: React.FC<StaggeredItemProps> = ({
  children,
  index,
  className,
  variant = 'listItem',
  customIncrement,
  as: Component = 'div'
}) => {
  const config = createStaggeredConfig(index, variant, customIncrement);
  const MotionComponent = motion[Component as keyof typeof motion] as any;
  
  return (
    <MotionComponent
      className={className}
      {...config}
    >
      {children}
    </MotionComponent>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  const config = createAnimationConfig('pageTransition');
  
  return (
    <motion.div
      className={className}
      {...config}
    >
      {children}
    </motion.div>
  );
};

// View transition wrapper for navigation
interface ViewTransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ViewTransitionLink: React.FC<ViewTransitionLinkProps> = ({
  href,
  children,
  className,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    createViewTransition(() => {
      if (onClick) {
        onClick();
      } else {
        window.location.href = href;
      }
    });
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

// Animated presence wrapper for conditional content
interface AnimatedPresenceWrapperProps {
  children: React.ReactNode;
  show: boolean;
  variant?: 'fadeInUp' | 'fadeInLeft' | 'scaleIn';
}

export const AnimatedPresenceWrapper: React.FC<AnimatedPresenceWrapperProps> = ({
  children,
  show,
  variant = 'fadeInUp'
}) => {
  const config = createAnimationConfig(variant, 0);
  
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div {...config}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
'use client';

/**
 * Animation Hooks
 * 
 * Custom hooks for managing animations in React components
 */

import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { animationManager, createAnimationConfig, createStaggeredConfig } from './animation-system';

// Hook for sequential animations
export const useSequentialAnimation = (variant: 'fadeInUp' | 'fadeInLeft' | 'scaleIn' = 'fadeInUp') => {
  const delay = useRef<number | null>(null);
  
  // Only get delay once per component instance
  if (delay.current === null) {
    delay.current = animationManager.getNextDelay();
    console.log(`🎬 Sequential animation delay: ${delay.current}s for variant: ${variant}`);
  }
  
  return createAnimationConfig(variant, delay.current);
};

// Hook for staggered animations in lists
export const useStaggeredAnimation = (
  index: number, 
  variant: 'listItem' | 'fadeInUp' = 'listItem',
  customIncrement?: number
) => {
  return createStaggeredConfig(index, variant, customIncrement);
};

// Hook for in-view animations
export const useInViewAnimation = (
  variant: 'fadeInUp' | 'fadeInLeft' | 'scaleIn' = 'fadeInUp',
  threshold: number = 0.1,
  triggerOnce: boolean = true
) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: triggerOnce,
    margin: '-10% 0px -10% 0px',
    amount: threshold
  });

  const config = createAnimationConfig(variant, 0);
  
  return {
    ref,
    ...config,
    animate: isInView ? config.animate : config.initial
  };
};

// Hook for resetting animations on page change
export const usePageAnimations = () => {
  useEffect(() => {
    // Reset animation delays when component mounts (new page)
    animationManager.reset();
    
    return () => {
      // Optional cleanup
    };
  }, []);

  return createAnimationConfig('pageTransition');
};

// Hook for managing animation delays in sections
export const useSectionAnimations = (baseDelay: number = 0.1) => {
  useEffect(() => {
    animationManager.setBaseDelay(baseDelay);
  }, [baseDelay]);

  return {
    getNext: () => createAnimationConfig('fadeInUp'),
    getStaggered: (index: number) => createStaggeredConfig(index),
    reset: () => animationManager.reset()
  };
};
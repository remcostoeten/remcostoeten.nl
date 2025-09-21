/**
 * Comprehensive Animation System
 * 
 * This system provides:
 * - Sequential animations with proper timing
 * - Global delay management
 * - Staggered animations for lists
 * - View transitions between pages
 * - Performance optimizations
 */

import { Variants } from 'framer-motion';

// Global animation state
class AnimationManager {
  private static instance: AnimationManager;
  private currentDelay = 0;
  private baseDelay = 0.1;
  private staggerIncrement = 0.05;
  private isReducedMotion = false;

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  constructor() {
    // Check for reduced motion preference only on client side
    this.checkReducedMotion();
  }

  private checkReducedMotion(): void {
    if (typeof window !== 'undefined') {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  // Reset delay counter for new page/section
  reset(): void {
    console.log('🔄 Animation Manager: Resetting delays to 0');
    this.currentDelay = 0;
  }

  // Get next sequential delay
  getNextDelay(): number {
    if (this.isReducedMotion) return 0;
    const delay = this.currentDelay;
    this.currentDelay += this.baseDelay;
    console.log(`🎯 Animation Manager: Returning delay ${delay}s, next will be ${this.currentDelay}s`);
    return delay;
  }

  // Get staggered delay for list items
  getStaggerDelay(index: number, customIncrement?: number): number {
    if (this.isReducedMotion) return 0;
    return index * (customIncrement || this.staggerIncrement);
  }

  // Set custom base delay
  setBaseDelay(delay: number): void {
    this.baseDelay = delay;
  }

  // Check if reduced motion is preferred
  isMotionReduced(): boolean {
    return this.isReducedMotion;
  }
}

// Animation variants
export const ANIMATION_VARIANTS = {
  // Basic fade in from bottom
  fadeInUp: {
    initial: { 
      opacity: 0, 
      y: 20,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.4, 0.0, 0.2, 1],
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      filter: 'blur(4px)',
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      }
    }
  } as Variants,

  // Fade in from left
  fadeInLeft: {
    initial: { 
      opacity: 0, 
      x: -30,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.4, 0.0, 0.2, 1],
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      filter: 'blur(4px)',
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      }
    }
  } as Variants,

  // Scale in animation
  scaleIn: {
    initial: { 
      opacity: 0, 
      scale: 0.95,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.4, 0.0, 0.2, 1],
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(4px)',
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      }
    }
  } as Variants,

  // Container for staggered children
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      }
    }
  } as Variants,

  // List item animation
  listItem: {
    initial: { 
      opacity: 0, 
      y: 20,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      filter: 'blur(4px)',
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 0.2, 1],
      }
    }
  } as Variants,

  // Page transition
  pageTransition: {
    initial: { 
      opacity: 0,
      y: 20,
      filter: 'blur(8px)'
    },
    animate: { 
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.4, 0.0, 0.2, 1],
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: 'blur(8px)',
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
      }
    }
  } as Variants,
};

// Animation configuration functions
export const createAnimationConfig = (
  variant: keyof typeof ANIMATION_VARIANTS,
  delay?: number,
  customTransition?: any
) => {
  const manager = AnimationManager.getInstance();
  const finalDelay = delay !== undefined ? delay : manager.getNextDelay();
  
  if (manager.isMotionReduced()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.1 }
    };
  }

  const config = { ...ANIMATION_VARIANTS[variant] };
  
  // Add delay to animate transition
  if (config.animate && typeof config.animate === 'object' && 'transition' in config.animate) {
    config.animate.transition = {
      ...config.animate.transition,
      delay: finalDelay,
      ...customTransition
    };
  }

  return config;
};

// Staggered animation for lists
export const createStaggeredConfig = (
  index: number,
  variant: keyof typeof ANIMATION_VARIANTS = 'listItem',
  customIncrement?: number
) => {
  const manager = AnimationManager.getInstance();
  const delay = manager.getStaggerDelay(index, customIncrement);
  
  return createAnimationConfig(variant, delay);
};

// Container animation for staggered children
export const createContainerConfig = (
  staggerDelay: number = 0.05,
  delayChildren: number = 0.1
) => {
  const manager = AnimationManager.getInstance();
  
  if (manager.isMotionReduced()) {
    return {
      initial: {},
      animate: {},
    };
  }

  return {
    ...ANIMATION_VARIANTS.staggerContainer,
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      }
    }
  };
};

// Export singleton instance
export const animationManager = AnimationManager.getInstance();

// Utility functions
export const resetAnimations = () => {
  animationManager.reset();
};

export const setBaseDelay = (delay: number) => {
  animationManager.setBaseDelay(delay);
};

// View transition API support
export const enableViewTransitions = () => {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    return true;
  }
  return false;
};

export const createViewTransition = (callback: () => void) => {
  if (enableViewTransitions() && 'startViewTransition' in document) {
    // @ts-ignore - View Transitions API is experimental
    return document.startViewTransition(callback);
  } else {
    // Fallback for browsers without View Transitions API
    callback();
    return Promise.resolve();
  }
};
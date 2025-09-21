/**
 * Animation System Exports
 * 
 * Centralized exports for the animation system
 */

// Core system
export {
  ANIMATION_VARIANTS,
  createAnimationConfig,
  createStaggeredConfig,
  createContainerConfig,
  createViewTransition,
  animationManager,
  resetAnimations,
  setBaseDelay,
  enableViewTransitions
} from './animation-system';

// Hooks
export {
  useSequentialAnimation,
  useStaggeredAnimation,
  useInViewAnimation,
  usePageAnimations,
  useSectionAnimations
} from './hooks';

// Components
export {
  SequentialAnimation,
  StaggeredList,
  StaggeredItem,
  PageTransition,
  ViewTransitionLink,
  AnimatedPresenceWrapper
} from './components';

// Note: ANIMATION_CONFIGS legacy export removed - use hooks and components instead
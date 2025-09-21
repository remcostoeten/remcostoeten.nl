/**
 * Animation System Tests
 */

import { animationManager, resetAnimations, createAnimationConfig } from '../animation-system';

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Animation System', () => {
  beforeEach(() => {
    resetAnimations();
  });

  describe('AnimationManager', () => {
    it('should provide sequential delays', () => {
      const delay1 = animationManager.getNextDelay();
      const delay2 = animationManager.getNextDelay();
      const delay3 = animationManager.getNextDelay();

      expect(delay1).toBe(0);
      expect(delay2).toBe(0.1);
      expect(delay3).toBe(0.2);
    });

    it('should reset delays', () => {
      animationManager.getNextDelay();
      animationManager.getNextDelay();
      
      resetAnimations();
      
      const delay = animationManager.getNextDelay();
      expect(delay).toBe(0);
    });

    it('should provide stagger delays', () => {
      const delay1 = animationManager.getStaggerDelay(0);
      const delay2 = animationManager.getStaggerDelay(1);
      const delay3 = animationManager.getStaggerDelay(2);

      expect(delay1).toBe(0);
      expect(delay2).toBe(0.05);
      expect(delay3).toBe(0.1);
    });

    it('should use custom stagger increment', () => {
      const delay1 = animationManager.getStaggerDelay(0, 0.2);
      const delay2 = animationManager.getStaggerDelay(1, 0.2);

      expect(delay1).toBe(0);
      expect(delay2).toBe(0.2);
    });
  });

  describe('createAnimationConfig', () => {
    it('should create fadeInUp config', () => {
      const config = createAnimationConfig('fadeInUp');
      
      expect(config.initial).toEqual({
        opacity: 0,
        y: 20,
        filter: 'blur(4px)'
      });
      
      expect(config.animate).toEqual({
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1],
          delay: 0
        }
      });
    });

    it('should apply custom delay', () => {
      const config = createAnimationConfig('fadeInUp', 0.5);
      
      expect(config.animate.transition.delay).toBe(0.5);
    });

    it('should handle reduced motion', () => {
      // Mock reduced motion preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      // Create new instance to pick up the mocked matchMedia
      const config = createAnimationConfig('fadeInUp');
      
      expect(config.initial).toEqual({ opacity: 0 });
      expect(config.animate).toEqual({ opacity: 1 });
      expect(config.transition.duration).toBe(0.1);
    });
  });
});
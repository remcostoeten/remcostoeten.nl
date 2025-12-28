'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useStaggerLayer } from './stagger-system';

// =============================================================================
// Legacy Context (for backward compatibility)
// =============================================================================

interface AnimatedNumberContextType {
  registerNumber: (id: string, element: HTMLElement) => void;
  unregisterNumber: (id: string) => void;
  getStaggerDelay: (id: string) => number;
}

const AnimatedNumberContext = createContext<AnimatedNumberContextType | null>(null);

export function AnimatedNumberProvider({ children }: { children: React.ReactNode }) {
  const [numbers, setNumbers] = useState<Map<string, { element: HTMLElement; rect: DOMRect }>>(new Map());

  const registerNumber = (id: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setNumbers(prev => new Map(prev).set(id, { element, rect }));
  };

  const unregisterNumber = (id: string) => {
    setNumbers(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const getStaggerDelay = (id: string) => {
    const numberData = numbers.get(id);
    if (!numberData) return 0;

    // Sort numbers by top position, then left position (top-left to bottom-right)
    const sortedNumbers = Array.from(numbers.entries())
      .sort(([, a], [, b]) => {
        if (Math.abs(a.rect.top - b.rect.top) < 50) {
          return a.rect.left - b.rect.left;
        }
        return a.rect.top - b.rect.top;
      });

    const index = sortedNumbers.findIndex(([key]) => key === id);
    return index * 100; // 100ms stagger between each number
  };

  return (
    <AnimatedNumberContext.Provider value={{ registerNumber, unregisterNumber, getStaggerDelay }}>
      {children}
    </AnimatedNumberContext.Provider>
  );
}

function useAnimatedNumberContext() {
  const context = useContext(AnimatedNumberContext);
  if (!context) {
    // Return a no-op context if not wrapped in provider (allows gradual migration)
    return {
      registerNumber: () => { },
      unregisterNumber: () => { },
      getStaggerDelay: () => 0,
    };
  }
  return context;
}

// =============================================================================
// Slot Digit Animation
// =============================================================================

const DIGIT_SETS = 3;
const DIGITS_PER_SET = 10;
const TOTAL_DIGITS = DIGIT_SETS * DIGITS_PER_SET;
const TARGET_SET_INDEX = 2;
const STAGGER_DELAY_MS = 40; // Faster stagger for smoother flow
const GRADIENT_HEIGHT_PERCENT = 20;
const INITIAL_BLUR_PX = 0.5;

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Create digit sequence 0-9 for spinning effect - must include ALL digits
const DIGIT_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const DIGITS = Array.from({ length: TOTAL_DIGITS }, (_, i) => DIGIT_SEQUENCE[i % DIGIT_SEQUENCE.length]);

type SlotDigitProps = {
  digit: number
  trigger: boolean
  duration: number
  delay?: number
  className?: string
  index: number
  /** Start the animation at a partially completed state (0-1, where 1 = 100% complete) */
  initialProgress?: number
}

function SlotDigit({
  digit,
  trigger,
  duration,
  delay = 0,
  className,
  index,
  initialProgress = 0
}: SlotDigitProps) {
  // Find the position of the target digit in our digit sequence (0-9)
  const targetDigitIndex = DIGIT_SEQUENCE.indexOf(digit);
  // Since we include all 0-9, this should always find the digit
  const targetOffset = (targetDigitIndex >= 0 ? targetDigitIndex : digit) + (TARGET_SET_INDEX * DIGITS_PER_SET);
  const itemHeightPercent = 100 / TOTAL_DIGITS;

  // Calculate scroll distance based on initial progress
  // If initialProgress is 0.75, we only show the last 25% of the animation
  const fullScrollDistance = 8;
  const effectiveScrollDistance = Math.max(1, fullScrollDistance * (1 - initialProgress));

  const initialOffset = targetOffset - effectiveScrollDistance;

  const transformInitial = `translateY(-${initialOffset * itemHeightPercent}%)`;
  const transformTarget = `translateY(-${targetOffset * itemHeightPercent}%)`;

  // Adjust duration based on initial progress
  const effectiveDuration = duration * (1 - initialProgress);

  return (
    <span
      className={`relative inline-block overflow-hidden h-[1em] leading-none align-baseline ${className || ''}`}
      style={{ width: '0.6em', minWidth: '0.6em' }}
    >
      <span className="opacity-0 absolute" style={{ visibility: 'hidden' }}>{digit}</span>

      <span
        className="absolute top-0 left-0 right-0 flex flex-col items-center will-change-transform"
        style={{
          transform: trigger ? transformTarget : transformInitial,
          filter: trigger ? 'blur(0px)' : `blur(${INITIAL_BLUR_PX}px)`,
          transition: `transform ${effectiveDuration}ms ${EASING} ${delay}ms, filter ${Math.min(effectiveDuration * 0.6, 300)}ms ease-out ${delay}ms`,
        }}
        aria-hidden="true"
      >
        {DIGITS.map((num, i) => (
          <span
            key={i}
            className="flex items-center justify-center mt-[.5px] h-[1em] leading-none select-none"
          >
            {num}
          </span>
        ))}
      </span>

      <span
        className="absolute inset-x-0 top-0 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"
        style={{ height: `${GRADIENT_HEIGHT_PERCENT}%` }}
      />
      <span
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"
        style={{ height: `${GRADIENT_HEIGHT_PERCENT}%` }}
      />
    </span>
  );
}

// =============================================================================
// AnimatedNumber Component
// =============================================================================

type Props = {
  value: string | number
  className?: string
  duration?: number
  /** @deprecated Use group + priority with StaggerProvider instead */
  delay?: number
  /** @deprecated Use priority: -Infinity instead */
  immediate?: boolean
  /** Stagger group name (for new stagger system) */
  group?: string
  /** Priority in stagger order - lower = earlier (for new stagger system) */
  priority?: number
  /** 
   * Initial progress of the spin animation (0-1). 
   * Set to 0.75 to show only the last 25% of the spin.
   * Useful for hero elements that should be partially animated on load.
   */
  initialProgress?: number
  /** If true, starts animation on mount without waiting for viewport intersection */
  animateOnMount?: boolean
}

export function AnimatedNumber({
  value,
  className,
  duration = 600,
  delay: legacyDelay = 0,
  immediate = false,
  group,
  priority,
  initialProgress = 1,
  animateOnMount = false,
}: Props) {
  const [isVisible, setIsVisible] = useState(immediate);
  const [isClient, setIsClient] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const stringValue = String(value);


  // Use new stagger system if group is provided
  const useNewSystem = group !== undefined;

  // New stagger system hook
  const stagger = useStaggerLayer<HTMLSpanElement>({
    group: group || 'numbers',
    priority: priority ?? (immediate ? -Infinity : Infinity),
    disabled: !useNewSystem,
  });

  // Legacy context hook
  const id = useRef(`animated-number-${Math.random().toString(36).substr(2, 9)}`).current;
  const { registerNumber, unregisterNumber, getStaggerDelay } = useAnimatedNumberContext();

  // Only enable view-based animations on client side
  const isInView = useInView(elementRef, { once: true, margin: "-50px" });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Legacy system registration
  useEffect(() => {
    if (isClient && elementRef.current && !useNewSystem) {
      registerNumber(id, elementRef.current);
      return () => unregisterNumber(id);
    }
  }, [isClient, registerNumber, unregisterNumber, id, useNewSystem]);

  // Legacy visibility triggering
  useEffect(() => {
    if (!useNewSystem && (isInView || animateOnMount) && !immediate) {
      const delay = getStaggerDelay(id);
      setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  }, [isInView, immediate, getStaggerDelay, id, useNewSystem]);

  // New system visibility triggering
  useEffect(() => {
    if (useNewSystem && stagger.isReady) {
      setTimeout(() => {
        setIsVisible(true);
      }, stagger.delay);
    }
  }, [useNewSystem, stagger.isReady, stagger.delay]);



  const chars = stringValue.split('');
  let digitIndex = 0;

  // Determine effective delay
  const effectiveDelay = useNewSystem ? 0 : legacyDelay;

  return (
    <span
      ref={useNewSystem ? stagger.ref as React.RefObject<HTMLSpanElement> : elementRef}
      className={`inline-flex items-baseline whitespace-pre-wrap translate-y-0.5 ${className || ''}`}
      aria-label={stringValue}
    >
      <span className="sr-only">{stringValue}</span>

      <span className="inline-flex items-baseline" aria-hidden="true">
        {chars.map((char, i) => {
          if (/\d/.test(char)) {
            const currentDigitDuration = Math.min(duration + (digitIndex * STAGGER_DELAY_MS), 1500);
            const currentDigitIndex = digitIndex;
            digitIndex++;

            return (
              <SlotDigit
                key={i}
                digit={parseInt(char, 10)}
                trigger={isVisible}
                duration={currentDigitDuration}
                delay={effectiveDelay}
                index={currentDigitIndex}
                initialProgress={initialProgress}
              />
            );
          }
          return <span key={i}>{char}</span>;
        })}
      </span>
    </span>
  );
}
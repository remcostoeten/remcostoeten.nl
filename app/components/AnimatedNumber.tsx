'use client';

import React, { useEffect, useRef, useState } from 'react';

// Use 3 sets of digits to allow for a longer, smoother scroll without running out of numbers.
// This ensures we can always scroll 'down' a fixed distance.
const DIGITS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9
];

interface SlotDigitProps {
  digit: number;
  trigger: boolean;
  duration: number;
  className?: string;
  index: number;
}

const SlotDigit: React.FC<SlotDigitProps> = ({ digit, trigger, duration, className, index }) => {
  // To ensure a consistent "speed" and visual feel, we want every digit to scroll
  // roughly the same distance (e.g., 12 slots).
  
  // We target the digit in the 3rd set (Index 20-29).
  const targetOffset = digit + 20;

  // We start exactly 12 slots above the target.
  // This means if target is 25 (digit 5), start is 13 (digit 3).
  // This guarantees uniform motion speed across all digits.
  const initialOffset = targetOffset - 12;

  // Percentage calculation: 30 items. Each item is 100% / 30 = 3.3333%
  const itemHeightPercent = 100 / 30;

  return (
    <span 
      className={`relative inline-block overflow-hidden h-[1em] leading-none align-baseline ${className || ''}`}
    >
      {/* Phantom digit for layout sizing */}
      <span className="opacity-0">{digit}</span>
      
      {/* The scrolling strip */}
      <span 
        className="absolute top-0 left-0 right-0 flex flex-col items-center will-change-transform"
        style={{
          transform: trigger 
            ? `translateY(-${targetOffset * itemHeightPercent}%)` 
            : `translateY(-${initialOffset * itemHeightPercent}%)`,
          
          // Enhanced motion blur effect
          filter: trigger ? 'blur(0px)' : 'blur(1px)',
            
          transition: `
            transform ${duration}ms cubic-bezier(0.2, 0.8, 0.4, 1) 0s,
            filter ${duration}ms ease-out 0s
          `,
        }}
        aria-hidden="true"
      >
        {DIGITS.map((num, i) => (
          <span 
            key={i} 
            className="flex items-center justify-center h-[1em] leading-none select-none"
          >
            {num}
          </span>
        ))}
      </span>
      
      {/* Top/Bottom gradient fade masks to soften the scrolling edge */}
      <span className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <span className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </span>
  );
};

interface AnimatedNumberProps {
  value: string | number;
  className?: string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, className, duration = 800 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const stringValue = value.toString();

  // Start animation immediately on mount (no delay)
  useEffect(() => {
    // Use requestAnimationFrame to ensure the initial render completes first,
    // then trigger the animation on the very next frame
    const frameId = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const chars = stringValue.split('');
  
  // Track numerical indices to stagger only digits
  let digitIndex = 0;

  return (
    <span 
      ref={elementRef} 
      className={`inline-flex items-baseline whitespace-pre-wrap ${className || ''}`}
      aria-label={stringValue}
    >
        <span className="sr-only">{stringValue}</span>
        
        <span className="inline-flex items-baseline" aria-hidden="true">
            {chars.map((char, i) => {
                if (/\d/.test(char)) {
                  // Stagger effect: later digits take longer to land
                  const currentDigitDuration = duration + (digitIndex * 100);
                  const currentDigitIndex = digitIndex;
                  digitIndex++;
                  
                  return (
                      <SlotDigit 
                          key={i} 
                          digit={parseInt(char, 10)} 
                          trigger={isVisible} 
                          duration={currentDigitDuration}
                          index={currentDigitIndex}
                      />
                  );
                }
                return <span key={i}>{char}</span>;
            })}
        </span>
    </span>
  );
};

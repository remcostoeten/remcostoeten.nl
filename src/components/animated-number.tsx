'use client';

import React, { useEffect, useRef, useState } from 'react';

const DIGIT_SETS = 3;
const DIGITS_PER_SET = 10;
const TOTAL_DIGITS = DIGIT_SETS * DIGITS_PER_SET;
const SCROLL_DISTANCE = 12;
const TARGET_SET_INDEX = 2;
const STAGGER_DELAY_MS = 60; // Faster stagger
const GRADIENT_HEIGHT_PERCENT = 20;
const INITIAL_BLUR_PX = 1;

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Snappier easing

const DIGITS = Array.from({ length: TOTAL_DIGITS }, (_, i) => i % DIGITS_PER_SET);

type TSlotDigit = {
  digit: number;
  trigger: boolean;
  duration: number;
  className?: string;
  index: number;
};

function SlotDigit({ digit, trigger, duration, className, index }: TSlotDigit) {
  const targetOffset = digit + (TARGET_SET_INDEX * DIGITS_PER_SET);
  const initialOffset = targetOffset - SCROLL_DISTANCE;
  const itemHeightPercent = 100 / TOTAL_DIGITS;

  const transformInitial = `translateY(-${initialOffset * itemHeightPercent}%)`;
  const transformTarget = `translateY(-${targetOffset * itemHeightPercent}%)`;

  return (
    <span 
      className={`relative inline-block overflow-hidden h-[1em] leading-none align-baseline ${className || ''}`}
      style={{ width: '0.6em', minWidth: '0.6em' }} // Fixed width to prevent layout shift
    >
      <span className="opacity-0 absolute" style={{ visibility: 'hidden' }}>{digit}</span>
      
      <span 
        className="absolute top-0 left-0 right-0 flex flex-col items-center will-change-transform"
        style={{
          transform: trigger ? transformTarget : transformInitial,
          filter: trigger ? 'blur(0px)' : `blur(${INITIAL_BLUR_PX}px)`,
          transition: `transform ${duration}ms ${EASING} 0s, filter ${duration}ms ease-out 0s`,
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

type TProps = {
  value: string | number;
  className?: string;
  duration?: number;
};

export function AnimatedNumber({ value, className, duration = 500 }: TProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const stringValue = String(value);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const chars = stringValue.split('');
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
            const currentDigitDuration = duration + (digitIndex * STAGGER_DELAY_MS);
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
}
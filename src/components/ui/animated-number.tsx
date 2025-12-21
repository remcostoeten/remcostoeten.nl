'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const DIGIT_SETS = 3;
const DIGITS_PER_SET = 10;
const TOTAL_DIGITS = DIGIT_SETS * DIGITS_PER_SET;
const SCROLL_DISTANCE = 8; // Reduced for better performance
const TARGET_SET_INDEX = 2;
const STAGGER_DELAY_MS = 40; // Faster stagger for smoother flow
const GRADIENT_HEIGHT_PERCENT = 20;
const INITIAL_BLUR_PX = 0.5; // Reduced blur for performance

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

const DIGITS = Array.from({ length: TOTAL_DIGITS }, (_, i) => i % DIGITS_PER_SET);

type SlotDigitProps = {
  digit: number
  trigger: boolean
  duration: number
  delay?: number
  className?: string
  index: number
}

function SlotDigit({ digit, trigger, duration, delay = 0, className, index }: SlotDigitProps) {
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
          transition: `transform ${duration}ms ${EASING} ${delay}ms, filter ${Math.min(duration * 0.6, 300)}ms ease-out ${delay}ms`,
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

type Props = {
  value: string | number
  className?: string
  duration?: number
  delay?: number
  immediate?: boolean // For hero section numbers that should animate immediately
}

export function AnimatedNumber({ value, className, duration = 600, delay = 0, immediate = false }: Props) {
  const [isVisible, setIsVisible] = useState(immediate);
  const [isClient, setIsClient] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const stringValue = String(value);
  const shouldReduceMotion = useReducedMotion();

  // Only enable view-based animations on client side
  const isInView = useInView(elementRef, { once: true, margin: "-50px" });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isInView && !immediate && !shouldReduceMotion) {
      setIsVisible(true);
    }
  }, [isInView, immediate, shouldReduceMotion]);

  // For SSR or reduced motion, show static number
  if (!isClient || shouldReduceMotion) {
    return (
      <span
        ref={elementRef}
        className={`inline-flex items-baseline whitespace-pre-wrap ${className || ''}`}
        aria-label={stringValue}
      >
        {stringValue}
      </span>
    );
  }

  const chars = stringValue.split('');
  let digitIndex = 0;

  return (
    <span
      ref={elementRef}
      className={`inline-flex items-baseline whitespace-pre-wrap translate-y-0.5 ${className || ''}`}
      aria-label={stringValue}
    >
      <span className="sr-only">{stringValue}</span>

      <span className="inline-flex items-baseline" aria-hidden="true">
        {chars.map((char, i) => {
          if (/\d/.test(char)) {
            const currentDigitDuration = Math.min(duration + (digitIndex * STAGGER_DELAY_MS), 1500); // Cap duration
            const currentDigitIndex = digitIndex;
            digitIndex++;

            return (
              <SlotDigit
                key={i}
                digit={parseInt(char, 10)}
                trigger={isVisible}
                duration={currentDigitDuration}
                delay={delay}
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
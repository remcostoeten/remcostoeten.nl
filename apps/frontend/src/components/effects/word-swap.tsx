'use client'

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type TProps = {
  staticText?: string;
  words: string[];
  interval?: number;
};

export function WordSwap({
  staticText = 'loading',
  words,
  interval = 2000,
}: TProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex items-center gap-2 text-2xl font-medium"
    >
      <span>{staticText}</span>
      <div className="relative inline-block overflow-hidden" style={{ width: '200px', height: '1.5em', perspective: '500px' }}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{
              rotateX: (index - i) * -90,
            }}
            transition={{
              duration: 0.6,
              ease: [0.68, -0.55, 0.265, 1.55],
            }}
            className="absolute left-0 top-0 block origin-center"
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>
      <span className="sr-only">Loading {words[index]}</span>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';

type TProps = {
  className?: string;
};

export function ScrollProgressIndicator({ className = '' }: TProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(function setupScrollListener() {
    function calculateScrollProgress() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      const scrollableHeight = documentHeight - windowHeight;
      
      if (scrollableHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      
      const progress = (scrollTop / scrollableHeight) * 100;
      const clampedProgress = Math.min(Math.max(progress, 0), 100);
      
      setScrollProgress(clampedProgress);
    }

    let timeoutId: NodeJS.Timeout | null = null;
    
    function throttledScrollHandler() {
      if (timeoutId === null) {
        timeoutId = setTimeout(function clearThrottle() {
          calculateScrollProgress();
          timeoutId = null;
        }, 16);
      }
    }

    calculateScrollProgress();
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    window.addEventListener('resize', calculateScrollProgress, { passive: true });

    return function cleanup() {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('resize', calculateScrollProgress);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-1 bg-border/30 z-40 zen-mode:hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="w-full bg-accent origin-top transition-all duration-200 ease-out hover:w-1.5 group"
        style={{
          height: `${scrollProgress}%`,
          boxShadow: scrollProgress > 0 ? '0 0 10px hsl(var(--accent) / 0.3)' : 'none',
        }}
      >
        <div className="absolute bottom-0 right-0 w-full h-20 bg-gradient-to-t from-accent to-transparent opacity-50" />
      </div>
    </div>
  );
}

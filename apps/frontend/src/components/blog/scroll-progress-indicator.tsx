'use client';

import { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';

type TProps = {
  className?: string;
};

export function ScrollProgressIndicator({ className = '' }: TProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    // Initial calculation with slight delay to ensure DOM is ready
    setTimeout(calculateScrollProgress, 100);

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
    <>
      {/* Desktop: Vertical progress bar */}
      <div
        className={`hidden md:block fixed top-0 right-0 h-screen w-1 bg-border/30 z-40 zen-mode:hidden ${className}`}
        aria-hidden="true"
        aria-label="Reading progress indicator"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress)}
        role="progressbar"
      >
        <div
          className="relative w-full bg-accent origin-top transition-all duration-200 ease-out hover:w-1.5 group"
          style={{
            height: `${scrollProgress}%`,
            boxShadow: scrollProgress > 0 ? '0 0 10px hsl(var(--accent) / 0.3)' : 'none',
          }}
        >
          {/* Gradient fade at the bottom of the progress bar */}
          <div
            className="absolute bottom-0 right-0 w-full bg-gradient-to-t from-accent via-accent/50 to-transparent"
            style={{
              height: '60px',
              opacity: scrollProgress > 5 ? 0.6 : 0,
              transition: 'opacity 0.2s ease-out',
            }}
          />

          {/* Additional glow effect at the very bottom */}
          <div
            className="absolute bottom-0 right-0 w-full h-4 bg-accent blur-sm"
            style={{
              opacity: scrollProgress > 5 ? 0.3 : 0,
              transform: 'scaleX(2)',
              transition: 'opacity 0.2s ease-out',
            }}
          />
        </div>
      </div>

      {/* Mobile: Percentage indicator in bottom right */}
      {isMobile && (
        <div
          className={`md:hidden fixed bottom-6 right-6 z-40 zen-mode:hidden ${className}`}
          aria-hidden="true"
          aria-label="Reading progress percentage"
        >
          <div
            className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-full shadow-lg transition-all duration-300"
            style={{
              opacity: scrollProgress > 2 ? 1 : 0,
              transform: `scale(${scrollProgress > 2 ? 1 : 0.8})`,
            }}
          >
            <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground">
              <AnimatedNumber
                value={Math.round(scrollProgress)}
                format="number"
                decimals={0}
                className="text-accent font-medium"
                randomStart={false}
                duration={300}
              />
              <span className="text-muted-foreground/70">%</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

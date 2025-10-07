'use client';

import { useState, useEffect, useRef } from 'react';

type TScrollDirection = 'up' | 'down' | 'none';

type TScrollAwareState = {
  isVisible: boolean;
  scrollDirection: TScrollDirection;
  scrollPercentage: number;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
};

type TScrollAwareOptions = {
  threshold?: number;
  hideOnScrollDown?: boolean;
  showOnScrollUp?: boolean;
  debounceMs?: number;
};

export function useScrollAwareVisibility(options: TScrollAwareOptions = {}): TScrollAwareState {
  const {
    threshold = 50,
    hideOnScrollDown = true,
    showOnScrollUp = true,
    debounceMs = 100,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<TScrollDirection>('none');
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(function setupScrollListener() {
    function calculateScrollPercentage(): number {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      
      if (trackLength <= 0) return 0;
      
      return Math.min(100, Math.max(0, (scrollTop / trackLength) * 100));
    }

    function updateScrollState() {
      const currentScrollY = window.scrollY;
      const percentage = calculateScrollPercentage();
      
      setScrollPercentage(percentage);

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      } else {
        setScrollDirection('none');
      }

      const shouldShow = percentage >= threshold;
      
      if (shouldShow) {
        if (hideOnScrollDown && scrollDirection === 'down') {
          setIsVisible(false);
        } else if (showOnScrollUp && currentScrollY < lastScrollY.current) {
          setIsVisible(true);
        } else if (scrollDirection === 'none') {
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    }

    function requestScrollUpdate() {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollState);
        ticking.current = true;
      }
    }

    function handleScroll() {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(function executeScrollUpdate() {
        requestScrollUpdate();
      }, debounceMs);

      requestScrollUpdate();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    updateScrollState();

    return function cleanup() {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [threshold, hideOnScrollDown, showOnScrollUp, debounceMs, scrollDirection]);

  return {
    isVisible,
    scrollDirection,
    scrollPercentage,
    isMinimized,
    setIsMinimized,
  };
}

"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';

type TViewTransitionContext = {
  startViewTransition: (callback: () => void) => void;
  isSupported: boolean;
};

const ViewTransitionContext = createContext<TViewTransitionContext | null>(null);

type TProps = {
  children: ReactNode;
};

export function ViewTransitionsProvider({ children }: TProps) {
  const isSupported = typeof document !== 'undefined' && 'startViewTransition' in document;

  function startViewTransition(callback: () => void) {
    if (isSupported && document.startViewTransition) {
      document.startViewTransition(callback);
    } else {
      // Fallback for browsers without view transitions
      callback();
    }
  }

  useEffect(() => {
    // Add view transition meta tag for better browser support
    if (typeof document !== 'undefined' && isSupported) {
      const meta = document.createElement('meta');
      meta.name = 'view-transition';
      meta.content = 'same-origin';
      document.head.appendChild(meta);
    }
  }, [isSupported]);

  return (
    <ViewTransitionContext.Provider value={{ startViewTransition, isSupported }}>
      {children}
    </ViewTransitionContext.Provider>
  );
}

export function useViewTransition() {
  const context = useContext(ViewTransitionContext);
  if (!context) {
    throw new Error('useViewTransition must be used within a ViewTransitionsProvider');
  }
  return context;
}

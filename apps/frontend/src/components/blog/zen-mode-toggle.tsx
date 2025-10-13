'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

type TProps = {
  enableAdvancedTransitions?: boolean;
};

export function ZenModeToggle({ enableAdvancedTransitions = false }: TProps) {
  const [isZenMode, setIsZenMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(function initializeZenMode() {
    setIsMounted(true);
    
    const savedZenMode = localStorage.getItem('zen-mode');
    const initialZenMode = savedZenMode === 'true';
    
    setIsZenMode(initialZenMode);
    
    if (initialZenMode) {
      document.body.classList.add('zen-mode');
    }
  }, []);

  function toggleZenMode() {
    const scrollPosition = window.scrollY || window.pageYOffset;
    const newZenMode = !isZenMode;

    if (enableAdvancedTransitions) {
      setIsTransitioning(true);

      if (newZenMode) {
        // Entering zen mode - smooth fade to centered view
        document.body.classList.add('zen-mode-epic-transitioning');
        document.documentElement.classList.add('zen-epic-transition');

        setTimeout(function applyZenModeAfterTransition() {
          setIsZenMode(newZenMode);
          document.body.classList.add('zen-mode');

          requestAnimationFrame(function restoreScroll() {
            window.scrollTo(0, scrollPosition);
          });

          localStorage.setItem('zen-mode', newZenMode.toString());

          setTimeout(function cleanupTransitionClasses() {
            document.body.classList.remove('zen-mode-epic-transitioning');
            document.documentElement.classList.remove('zen-epic-transition');
            setIsTransitioning(false);
          }, 300);
        }, 50);
      } else {
        // Exiting zen mode - smooth transition back to normal layout
        document.body.classList.add('zen-mode-exit-transitioning');
        document.documentElement.classList.add('zen-epic-transition');

        setTimeout(function applyNormalModeAfterTransition() {
          setIsZenMode(newZenMode);
          document.body.classList.remove('zen-mode');

          requestAnimationFrame(function restoreScroll() {
            window.scrollTo(0, scrollPosition);
          });

          localStorage.setItem('zen-mode', newZenMode.toString());

          setTimeout(function cleanupExitTransitionClasses() {
            document.body.classList.remove('zen-mode-exit-transitioning');
            document.documentElement.classList.remove('zen-epic-transition');
            setIsTransitioning(false);
          }, 400);
        }, 50);
      }
    } else {
      setIsZenMode(newZenMode);

      if (newZenMode) {
        document.body.classList.add('zen-mode');
      } else {
        document.body.classList.remove('zen-mode');
      }

      requestAnimationFrame(function restoreScroll() {
        window.scrollTo(0, scrollPosition);
      });

      localStorage.setItem('zen-mode', newZenMode.toString());
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleZenMode();
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={toggleZenMode}
        onKeyDown={handleKeyDown}
        disabled={isTransitioning}
        className="p-3 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-accent/10 hover:border-accent/50 group disabled:opacity-50 disabled:cursor-not-allowed"
        title={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
        aria-label={isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
        aria-pressed={isZenMode}
      >
        <Eye 
          className={`w-5 h-5 transition-colors duration-300 ${
            isZenMode ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'
          }`}
        />
      </button>
    </div>
  );
}

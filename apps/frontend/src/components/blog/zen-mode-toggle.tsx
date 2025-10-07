'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

export function ZenModeToggle() {
  const [isZenMode, setIsZenMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
    const newZenMode = !isZenMode;
    setIsZenMode(newZenMode);
    
    if (newZenMode) {
      document.body.classList.add('zen-mode');
    } else {
      document.body.classList.remove('zen-mode');
    }
    
    localStorage.setItem('zen-mode', newZenMode.toString());
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
        className="p-3 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-accent/10 hover:border-accent/50 group"
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

'use client';

import { useState, useEffect } from 'react';
import { TimerControls } from './timer-controls';
import { useTimeComponents } from "../hooks/use-current-time";
import { setTimerAnimationDisabled, isTimerAnimationDisabled } from "@/shared/utilities";

export function StaticTimer() {
  const { hours, minutes, seconds } = useTimeComponents();
  const [isHiding, setIsHiding] = useState(false);

  const handleToggleAnimation = () => {
    setTimerAnimationDisabled(false);
    setIsHiding(true);
    setTimeout(() => {
      // This will trigger a re-render in the parent component
      window.location.reload();
    }, 300);
  };

  const handleHideTimer = () => {
    setIsHiding(true);
    setTimeout(() => {
      // Hide timer by setting hidden flag
      localStorage.setItem('timer-hidden', 'true');
      setIsHiding(false);
    }, 300);
  };

  return (
    <>
      {/* Desktop version - static numbers */}
      <div className={`hidden md:block fixed top-4 right-4 z-50 group transition-all duration-300 ${
        isHiding ? 'animate-out fade-out slide-out-to-top-2' : 'animate-in fade-in slide-in-from-top-2'
      }`}>
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-md border border-border/60 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-xs text-muted-foreground font-medium tracking-wide">AMS</div>
            <div className="flex items-center gap-1 text-sm font-mono">
              <span className="inline-block font-mono tabular-nums transition-all duration-200 hover:scale-105" style={{ width: '1.2ch', textAlign: 'center' }}>
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-muted-foreground animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums transition-all duration-200 hover:scale-105" style={{ width: '1.2ch', textAlign: 'center' }}>
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-muted-foreground animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums transition-all duration-200 hover:scale-105" style={{ width: '1.2ch', textAlign: 'center' }}>
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
          <TimerControls
            onHideTimer={handleHideTimer}
            onToggleAnimation={handleToggleAnimation}
            animationDisabled={true}
          />
        </div>
      </div>

      {/* Mobile version - static numbers */}
      <div className={`md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 group transition-all duration-300 ${
        isHiding ? 'animate-out fade-out slide-out-to-bottom-2' : 'animate-in fade-in slide-in-from-bottom-2'
      }`}>
        <div className="relative">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-background/60 backdrop-blur-sm border border-border/30 rounded-full shadow-lg transition-all duration-300">
            <div className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">AMS/CEST</div>
            <div className="flex items-center gap-0.5 text-xs font-mono text-muted-foreground/70">
              <span className="inline-block font-mono tabular-nums" style={{ width: '1ch', textAlign: 'center' }}>
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-muted-foreground/50 animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums" style={{ width: '1ch', textAlign: 'center' }}>
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-muted-foreground/50 animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums" style={{ width: '1ch', textAlign: 'center' }}>
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
          <TimerControls
            onHideTimer={handleHideTimer}
            onToggleAnimation={handleToggleAnimation}
            animationDisabled={true}
          />
        </div>
      </div>
    </>
  );
}
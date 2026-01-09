'use client';

import { useState, useEffect } from 'react';
import { AnimatedNumber } from "@/shared/effects/number-flow";
import { SimpleNumberFlow } from "@/shared/effects/simple-number-flow";
import { TimerControls } from './timer-controls';
import { StaticTimer } from './static-timer';
import { useTimeComponents } from "../hooks/use-current-time";
import { setTimerHidden, setTimerAnimationDisabled, isTimerHidden, isTimerAnimationDisabled } from "@/shared/utilities";


export function TimezoneSection() {
  const { hours, minutes, seconds } = useTimeComponents();
  const [isHidden, setIsHidden] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [animationDisabled, setAnimationDisabled] = useState(false);

  // Load user preferences from localStorage on mount
  useEffect(() => {
    setIsHidden(isTimerHidden());
    setAnimationDisabled(isTimerAnimationDisabled());
  }, []);

  const handleHideTimer = () => {
    setIsHiding(true);
    // Animate out
    setTimeout(() => {
      setIsHidden(true);
      setTimerHidden(true);
      setIsHiding(false);
    }, 300); // Match animation duration
  };

  const handleToggleAnimation = () => {
    const newAnimationState = !animationDisabled;
    setAnimationDisabled(newAnimationState);
    setTimerAnimationDisabled(newAnimationState);
  };

  // Don't render if hidden
  if (isHidden) {
    return null;
  }

  // If animation is disabled, show static timer
  if (animationDisabled) {
    return <StaticTimer />;
  }

  return (
    <>
      {/* Desktop version - animated with hover controls */}
      <div className={`hidden md:block fixed top-4 right-4 z-50 group transition-all duration-300 ${
        isHiding ? 'animate-out fade-out slide-out-to-top-2' : 'animate-in fade-in slide-in-from-top-2'
      }`}>
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-md border border-border/60 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-xs text-muted-foreground font-medium tracking-wide">AMS</div>
            <div className="flex items-center gap-1 text-sm font-mono">
              <span className="inline-block font-mono tabular-nums transition-all duration-200 hover:scale-105" style={{ width: '1.2ch', textAlign: 'center' }}>
                <SimpleNumberFlow value={hours} />
              </span>
              <span className="text-muted-foreground animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums transition-all duration-200 hover:scale-105" style={{ width: '1.2ch', textAlign: 'center' }}>
                <SimpleNumberFlow value={minutes} />
              </span>
              <span className="text-muted-foreground animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums transition-all duration-200 hover:scale-105" style={{ width: '1.2ch', textAlign: 'center' }}>
                <SimpleNumberFlow value={seconds} />
              </span>
            </div>
          </div>
          <TimerControls
            onHideTimer={handleHideTimer}
            onToggleAnimation={handleToggleAnimation}
            animationDisabled={animationDisabled}
          />
        </div>
      </div>

      {/* Mobile version - bottom center with lower opacity */}
      <div className={`md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 group transition-all duration-300 ${
        isHiding ? 'animate-out fade-out slide-out-to-bottom-2' : 'animate-in fade-in slide-in-from-bottom-2'
      }`}>
        <div className="relative">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-background/60 backdrop-blur-sm border border-border/30 rounded-full shadow-lg transition-all duration-300">
            <div className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">AMS/CEST</div>
            <div className="flex items-center gap-0.5 text-xs font-mono text-muted-foreground/70">
              <span className="inline-block font-mono tabular-nums" style={{ width: '1ch', textAlign: 'center' }}>
                <SimpleNumberFlow value={hours} />
              </span>
              <span className="text-muted-foreground/50 animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums" style={{ width: '1ch', textAlign: 'center' }}>
                <SimpleNumberFlow value={minutes} />
              </span>
              <span className="text-muted-foreground/50 animate-pulse">:</span>
              <span className="inline-block font-mono tabular-nums" style={{ width: '1ch', textAlign: 'center' }}>
                <SimpleNumberFlow value={seconds} />
              </span>
            </div>
          </div>
          <TimerControls
            onHideTimer={handleHideTimer}
            onToggleAnimation={handleToggleAnimation}
            animationDisabled={animationDisabled}
          />
        </div>
      </div>
    </>
  );
};
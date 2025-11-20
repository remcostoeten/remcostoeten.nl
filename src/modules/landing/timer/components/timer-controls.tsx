'use client';

import { useState } from 'react';
import { X, Pause, Play } from 'lucide-react';

interface TimerControlsProps {
  onHideTimer: () => void;
  onToggleAnimation: () => void;
  animationDisabled: boolean;
}

export function TimerControls({ onHideTimer, onToggleAnimation, animationDisabled }: TimerControlsProps) {
  return (
    <div className="absolute -top-2 -right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="bg-background border border-border rounded-lg shadow-lg p-1 flex flex-col gap-1">
        <button
          onClick={onHideTimer}
          className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded transition-colors"
          title="Remove timer"
        >
          <X size={12} />
          <span>Remove</span>
        </button>
        <button
          onClick={onToggleAnimation}
          className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded transition-colors"
          title={animationDisabled ? "Enable animation" : "Disable animation"}
        >
          {animationDisabled ? <Play size={12} /> : <Pause size={12} />}
          <span>{animationDisabled ? "Animate" : "No animation"}</span>
        </button>
      </div>
    </div>
  );
}
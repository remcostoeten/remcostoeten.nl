import React from 'react';
import { useKeyboardShortcutsContext } from './keyboard-shortcuts-provider';

type TProps = {
  className?: string;
};

export function KeyboardShortcutIndicator({ className = '' }: TProps) {
  const { currentSequence, isRecording } = useKeyboardShortcutsContext();

  if (!isRecording || currentSequence.length === 0) {
    return null;
  }

  const displaySequence = currentSequence.map(keystroke => {
    const modifiers = keystroke.modifiers?.join('+') || '';
    const key = keystroke.key === 'space' ? '⎵' : keystroke.key;
    return modifiers ? `${modifiers}+${key}` : key;
  });

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-background/95 backdrop-blur-md text-foreground px-4 py-3 rounded-xl shadow-2xl border border-border/50 ring-1 ring-primary/20">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground font-medium">Shortcut:</span>
          <div className="flex items-center gap-2">
            {displaySequence.map((key, index) => (
              <React.Fragment key={index}>
                <kbd className="bg-gradient-to-b from-primary/20 to-primary/30 border border-primary/40 text-primary shadow-md px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider animate-pulse">
                  {key}
                </kbd>
                {index < displaySequence.length - 1 && (
                  <span className="text-primary/60 text-lg">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

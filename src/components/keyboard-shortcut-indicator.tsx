import React from 'react';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';

type TProps = {
  className?: string;
};

export function KeyboardShortcutIndicator({ className = '' }: TProps) {
  const { currentSequence, isRecording } = useKeyboardShortcuts([], {
    debug: false,
    ignoreInputs: true,
  });

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
      <div className="bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-300">Shortcut:</span>
          <div className="flex items-center gap-1">
            {displaySequence.map((key, index) => (
              <React.Fragment key={index}>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                  {key}
                </kbd>
                {index < displaySequence.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

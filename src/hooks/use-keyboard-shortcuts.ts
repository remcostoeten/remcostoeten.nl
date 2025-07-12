import { useEffect, useCallback } from 'react';

type TShortcutHandler = () => void;

type TShortcuts = {
  [key: string]: TShortcutHandler;
};

function useKeyboardShortcuts(shortcuts: TShortcuts, deps: any[] = []) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).contentEditable === 'true'
    ) {
      return;
    }

    const { key, metaKey, ctrlKey, shiftKey, altKey, getModifierState } = event;
    
    // Build shortcut string
    let shortcut = '';
    if (metaKey || ctrlKey) shortcut += 'cmd+';
    if (shiftKey) shortcut += 'shift+';
    if (altKey) shortcut += 'alt+';
    if (getModifierState('CapsLock')) shortcut += 'capslock+';
    shortcut += key.toLowerCase();

    if (shortcuts[shortcut]) {
      event.preventDefault();
      shortcuts[shortcut]();
    }
  }, deps);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;

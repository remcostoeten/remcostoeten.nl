import { useEffect } from "react";

type TKeyboardShortcutHandler = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (event: KeyboardEvent) => void;
};

function useKeyboardShortcuts(shortcuts: TKeyboardShortcutHandler[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      shortcuts.forEach((shortcut) => {
        const isMetaMatch = shortcut.meta === undefined || shortcut.meta === event.metaKey;
        const isCtrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
        const isShiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const isAltMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const isKeyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();

        if (isKeyMatch && isMetaMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
          event.preventDefault();
          shortcut.handler(event);
        }
      });
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

export { useKeyboardShortcuts };

export function isMac(): boolean {
  return typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function getModifierKeyText(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

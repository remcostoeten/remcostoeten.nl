import type { TDisplayKeystroke } from '../hooks/types/keyboard-shortcuts';

/**
 * Saves a recent shortcut to session storage
 * @param shortcut - The keystroke object to save
 */
export function saveRecentShortcut(shortcut: TDisplayKeystroke): void {
  try {
    sessionStorage.setItem('recentShortcut', JSON.stringify(shortcut));
  } catch (error) {
    console.error('Failed to save recent shortcut:', error);
  }
}

/**
 * Reads the most recent shortcut from session storage
 * @returns The stored keystroke object or null if not found
 */
export function readRecentShortcut(): TDisplayKeystroke | null {
  const DISPLAY_DURATION = 2500;
  try {
    const stored = sessionStorage.getItem('recentShortcut');
    if (stored) {
      const shortcut = JSON.parse(stored);
      if (Date.now() - shortcut.timestamp > 2 * DISPLAY_DURATION) {
        clearRecentShortcut();
        return null;
      }
      return shortcut;
    }
    return null;
  } catch (error) {
    console.error('Failed to read recent shortcut:', error);
    return null;
  }
}

/**
 * Clears the recent shortcut from session storage
 */
export function clearRecentShortcut(): void {
  try {
    sessionStorage.removeItem('recentShortcut');
  } catch (error) {
    console.error('Failed to clear recent shortcut:', error);
  }
}

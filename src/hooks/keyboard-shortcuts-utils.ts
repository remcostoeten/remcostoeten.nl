import type { 
  TShortcutConfig, 
  TKeystroke, 
  TModifierKey, 
  TSpecialKey 
} from './use-keyboard-shortcuts';

/**
 * @fileoverview Utility functions and helpers for keyboard shortcuts
 */

/**
 * Create a keystroke with optional modifiers
 * @param key The key to press
 * @param modifiers Optional modifier keys
 */
export function createKeystroke(
  key: string | TSpecialKey, 
  modifiers?: TModifierKey[]
): TKeystroke {
  return {
    key: key as string,
    modifiers: modifiers?.length ? modifiers : undefined,
  };
}

/**
 * Create a shortcut configuration
 * @param id Unique identifier
 * @param name Display name
 * @param sequence Array of keystrokes
 * @param action Function to execute
 * @param options Additional options
 */
export function createShortcut(
  id: string,
  name: string,
  sequence: TKeystroke[],
  action: () => void,
  options?: Partial<Pick<TShortcutConfig, 'description' | 'enabled' | 'global'>>
): TShortcutConfig {
  return {
    id,
    name,
    sequence,
    action,
    description: options?.description,
    enabled: options?.enabled ?? true,
    global: options?.global ?? false,
  };
}

/** Helper functions for creating keystrokes with common modifiers */
export const KeyHelpers = {
  ctrl: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['ctrl']),
  alt: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['alt']),
  shift: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['shift']),
  meta: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['meta']),
  cmd: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['cmd']),
  
  ctrlShift: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['ctrl', 'shift']),
  ctrlAlt: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['ctrl', 'alt']),
  altShift: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['alt', 'shift']),
  metaShift: (key: string | TSpecialKey): TKeystroke => createKeystroke(key, ['meta', 'shift']),
  
  plain: (key: string | TSpecialKey): TKeystroke => createKeystroke(key),
};

/** Common special keys */
export const CommonKeys = {
  space: 'space' as const,
  enter: 'enter' as const,
  escape: 'escape' as const,
  backspace: 'backspace' as const,
  delete: 'delete' as const,
  tab: 'tab' as const,
  arrowUp: 'arrowup' as const,
  arrowDown: 'arrowdown' as const,
  arrowLeft: 'arrowleft' as const,
  arrowRight: 'arrowright' as const,
};

/**
 * Parse shortcut string to keystroke sequence
 * @param shortcutString String like "ctrl+k space"
 */
export function sequenceFromString(shortcutString: string): TKeystroke[] {
  const parts = shortcutString.split(' ');
  
  return parts.map(part => {
    const [keyPart, ...modifierParts] = part.split('+').reverse();
    const modifiers = modifierParts.reverse() as TModifierKey[];
    
    return createKeystroke(keyPart, modifiers.length ? modifiers : undefined);
  });
}

/**
 * Convert keystroke sequence to string representation
 * @param sequence Array of keystrokes
 */
export function stringFromSequence(sequence: TKeystroke[]): string {
  return sequence.map(keystroke => {
    const modifiers = keystroke.modifiers || [];
    const parts = [...modifiers, keystroke.key];
    return parts.join('+');
  }).join(' ');
}

/** Create common navigation shortcuts */
export function createNavigationShortcuts(router: { push: (path: string) => void }) {
  return [
    createShortcut(
      'nav-home',
      'Navigate to Home',
      [KeyHelpers.plain('g'), KeyHelpers.plain('h')],
      () => router.push('/'),
      { description: 'Quick navigation to home page' }
    ),
    
    createShortcut(
      'nav-dashboard',
      'Navigate to Dashboard',
      [KeyHelpers.plain('g'), KeyHelpers.plain('d')],
      () => router.push('/dashboard'),
      { description: 'Quick navigation to dashboard' }
    ),
    
    createShortcut(
      'nav-settings',
      'Navigate to Settings',
      [KeyHelpers.plain('g'), KeyHelpers.plain('s')],
      () => router.push('/settings'),
      { description: 'Quick navigation to settings' }
    ),
  ];
}

/** Create common modal shortcuts */
export function createModalShortcuts(
  openModal: () => void,
  closeModal: () => void
) {
  return [
    createShortcut(
      'modal-open',
      'Open Modal',
      [KeyHelpers.ctrl('m')],
      openModal,
      { description: 'Open modal dialog' }
    ),
    
    createShortcut(
      'modal-close',
      'Close Modal',
      [KeyHelpers.plain('escape')],
      closeModal,
      { description: 'Close modal dialog' }
    ),
  ];
}

/** Create common search shortcuts */
export function createSearchShortcuts(
  focusSearch: () => void,
  clearSearch: () => void
) {
  return [
    createShortcut(
      'focus-search',
      'Focus Search',
      [KeyHelpers.ctrl('k')],
      focusSearch,
      { description: 'Focus search input' }
    ),
    
    createShortcut(
      'clear-search',
      'Clear Search',
      [KeyHelpers.ctrl('l')],
      clearSearch,
      { description: 'Clear search input' }
    ),
  ];
}

/**
 * Create shortcut from array of key strings
 * @param id Unique identifier
 * @param name Display name
 * @param sequence Array of key strings
 * @param action Function to execute
 * @param description Optional description
 */
export function createCustomSequenceShortcut(
  id: string,
  name: string,
  sequence: string[],
  action: () => void,
  description?: string
) {
  const keystrokeSequence = sequence.map(key => KeyHelpers.plain(key));
  
  return createShortcut(id, name, keystrokeSequence, action, { description });
}

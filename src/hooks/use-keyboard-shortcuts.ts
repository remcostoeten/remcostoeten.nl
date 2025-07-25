import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * @fileoverview Custom hook for managing keyboard shortcuts with multi-keystroke support
 */

/** Supported modifier keys */
type TModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta' | 'cmd';
/** Special keys with normalized names */
type TSpecialKey = 'space' | 'enter' | 'escape' | 'backspace' | 'delete' | 'tab' | 'arrowup' | 'arrowdown' | 'arrowleft' | 'arrowright';
type TKey = string | TSpecialKey;

/** Single keystroke with optional modifiers */
type TKeystroke = {
  key: TKey;
  modifiers?: TModifierKey[];
};

type TShortcutSequence = TKeystroke[];

/** Configuration for a keyboard shortcut */
type TShortcutConfig = {
  id: string;
  name: string;
  description?: string;
  sequence: TShortcutSequence;
  action: () => void;
  enabled?: boolean;
  global?: boolean;
};

/** Options for keyboard shortcut behavior */
type TShortcutOptions = {
  /** Timeout between keystrokes in ms */
  sequenceTimeout?: number;
  /** Prevent default browser behavior on match */
  preventDefaultOnMatch?: boolean;
  /** Ignore shortcuts when input elements are focused */
  ignoreInputs?: boolean;
  /** Enable debug logging */
  debug?: boolean;
};

type TKeyboardShortcutsState = {
  currentSequence: TKeystroke[];
  isRecording: boolean;
  lastKeystroke: number;
  matchedShortcutId: string | null;
};

const INITIAL_STATE: TKeyboardShortcutsState = {
  currentSequence: [],
  isRecording: false,
  lastKeystroke: 0,
  matchedShortcutId: null,
};

const DEFAULT_OPTIONS: Required<TShortcutOptions> = {
  sequenceTimeout: 1000,
  preventDefaultOnMatch: true,
  ignoreInputs: true,
  debug: false,
};

const MODIFIER_KEY_MAP: Record<string, TModifierKey> = {
  Control: 'ctrl',
  Alt: 'alt',
  Shift: 'shift',
  Meta: 'meta',
  Cmd: 'cmd',
} as const;

const SPECIAL_KEY_MAP: Record<string, TSpecialKey> = {
  ' ': 'space',
  Enter: 'enter',
  Escape: 'escape',
  Backspace: 'backspace',
  Delete: 'delete',
  Tab: 'tab',
  ArrowUp: 'arrowup',
  ArrowDown: 'arrowdown',
  ArrowLeft: 'arrowleft',
  ArrowRight: 'arrowright',
} as const;

const INPUT_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT'];

/** Normalize key to consistent format */
function normalizeKey(key: string): TKey {
  return SPECIAL_KEY_MAP[key] || key.toLowerCase();
}

/** Extract modifier keys from keyboard event */
function getModifiersFromEvent(event: KeyboardEvent): TModifierKey[] {
  const modifiers: TModifierKey[] = [];
  
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  if (event.metaKey) modifiers.push('meta');
  
  return modifiers;
}

/** Check if an input element is currently focused */
function isInputActive(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  return (
    INPUT_ELEMENTS.includes(activeElement.tagName) ||
    activeElement.hasAttribute('contenteditable') ||
    (activeElement as HTMLElement).isContentEditable
  );
}

/** Compare two keystrokes for equality */
function keystrokeMatches(a: TKeystroke, b: TKeystroke): boolean {
  if (a.key !== b.key) return false;
  
  const aModifiers = (a.modifiers || []).sort();
  const bModifiers = (b.modifiers || []).sort();
  
  if (aModifiers.length !== bModifiers.length) return false;
  
  return aModifiers.every((mod, index) => mod === bModifiers[index]);
}

/** Check if current sequence matches target sequence */
function sequenceMatches(sequence: TShortcutSequence, currentSequence: TKeystroke[]): boolean {
  if (sequence.length !== currentSequence.length) return false;
  
  return sequence.every((keystroke, index) => 
    keystrokeMatches(keystroke, currentSequence[index])
  );
}

function shortcutReducer(
  state: TKeyboardShortcutsState,
  action: 
    | { type: 'ADD_KEYSTROKE'; keystroke: TKeystroke; timestamp: number }
    | { type: 'CLEAR_SEQUENCE' }
    | { type: 'SET_MATCH'; shortcutId: string }
    | { type: 'RESET' }
): TKeyboardShortcutsState {
  switch (action.type) {
    case 'ADD_KEYSTROKE':
      return {
        ...state,
        currentSequence: [...state.currentSequence, action.keystroke],
        isRecording: true,
        lastKeystroke: action.timestamp,
        matchedShortcutId: null,
      };
    
    case 'CLEAR_SEQUENCE':
      return {
        ...state,
        currentSequence: [],
        isRecording: false,
        matchedShortcutId: null,
      };
    
    case 'SET_MATCH':
      return {
        ...state,
        matchedShortcutId: action.shortcutId,
      };
    
    case 'RESET':
      return INITIAL_STATE;
    
    default:
      return state;
  }
}

/**
 * Hook for managing keyboard shortcuts with multi-keystroke support
 * @param shortcuts Array of shortcut configurations
 * @param options Configuration options for shortcut behavior
 * @returns Object with shortcut state and management functions
 */
export function useKeyboardShortcuts(
  shortcuts: TShortcutConfig[],
  options: TShortcutOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<TKeyboardShortcutsState>(INITIAL_STATE);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearSequence = useCallback(() => {
    setState(prev => shortcutReducer(prev, { type: 'CLEAR_SEQUENCE' }));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const executeShortcut = useCallback((shortcut: TShortcutConfig) => {
    if (mergedOptions.debug) {
      console.log(`Executing shortcut: ${shortcut.name}`);
    }
    
    setState(prev => shortcutReducer(prev, { type: 'SET_MATCH', shortcutId: shortcut.id }));
    shortcut.action();
    clearSequence();
  }, [clearSequence, mergedOptions.debug]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (mergedOptions.ignoreInputs && isInputActive()) {
      return;
    }
    
    const key = normalizeKey(event.key);
    const modifiers = getModifiersFromEvent(event);
    
    if (Object.values(MODIFIER_KEY_MAP).includes(key as TModifierKey)) {
      return;
    }
    
    const keystroke: TKeystroke = {
      key,
      modifiers: modifiers.length > 0 ? modifiers : undefined,
    };
    
    const timestamp = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState(prev => {
      const newState = shortcutReducer(prev, { 
        type: 'ADD_KEYSTROKE', 
        keystroke, 
        timestamp 
      });
      
      const enabledShortcuts = shortcuts.filter(s => s.enabled !== false);
      
      for (const shortcut of enabledShortcuts) {
        if (sequenceMatches(shortcut.sequence, newState.currentSequence)) {
          if (mergedOptions.preventDefaultOnMatch) {
            event.preventDefault();
            event.stopPropagation();
          }
          
          setTimeout(() => executeShortcut(shortcut), 0);
          return newState;
        }
      }
      
      const hasPartialMatch = enabledShortcuts.some(shortcut =>
        shortcut.sequence.length >= newState.currentSequence.length &&
        newState.currentSequence.every((keystroke, index) =>
          keystrokeMatches(keystroke, shortcut.sequence[index])
        )
      );
      
      if (!hasPartialMatch) {
        return shortcutReducer(newState, { type: 'CLEAR_SEQUENCE' });
      }
      
      return newState;
    });
    
    timeoutRef.current = setTimeout(() => {
      clearSequence();
    }, mergedOptions.sequenceTimeout);
    
    if (mergedOptions.debug) {
      console.log(`Keystroke: ${key}${modifiers.length ? ` (${modifiers.join('+')})` : ''}`);
    }
  }, [shortcuts, mergedOptions, executeShortcut, clearSequence]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);
  
  const addShortcut = useCallback((shortcut: TShortcutConfig) => {
    shortcuts.push(shortcut);
  }, [shortcuts]);
  
  const removeShortcut = useCallback((id: string) => {
    const index = shortcuts.findIndex(s => s.id === id);
    if (index !== -1) {
      shortcuts.splice(index, 1);
    }
  }, [shortcuts]);
  
  const updateShortcut = useCallback((id: string, updates: Partial<TShortcutConfig>) => {
    const shortcut = shortcuts.find(s => s.id === id);
    if (shortcut) {
      Object.assign(shortcut, updates);
    }
  }, [shortcuts]);
  
  const reset = useCallback(() => {
    setState(prev => shortcutReducer(prev, { type: 'RESET' }));
    clearSequence();
  }, [clearSequence]);
  
  return {
    currentSequence: state.currentSequence,
    isRecording: state.isRecording,
    matchedShortcutId: state.matchedShortcutId,
    addShortcut,
    removeShortcut,
    updateShortcut,
    reset,
    clearSequence,
  };
}

export type {
  TShortcutConfig,
  TShortcutSequence,
  TKeystroke,
  TModifierKey,
  TSpecialKey,
  TKey,
  TShortcutOptions,
};

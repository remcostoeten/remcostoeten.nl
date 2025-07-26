import { createSignal, createEffect, onCleanup } from 'solid-js';
import type {
  TShortcutConfig,
  TKeystroke,
  TModifierKey,
  TSpecialKey,
  TShortcutOptions,
  TKeyboardShortcutsState,
  TShortcutSequence,
} from './types/keyboard-shortcuts';

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

function normalizeKey(key: string): string {
  return SPECIAL_KEY_MAP[key] || key.toLowerCase();
}

function getModifiersFromEvent(event: KeyboardEvent): TModifierKey[] {
  const modifiers: TModifierKey[] = [];

  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  if (event.metaKey) modifiers.push('meta');

  return modifiers;
}

function isInputActive(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  return (
    INPUT_ELEMENTS.includes(activeElement.tagName) ||
    activeElement.hasAttribute('contenteditable') ||
    (activeElement as HTMLElement).isContentEditable
  );
}

function keystrokeMatches(a: TKeystroke, b: TKeystroke): boolean {
  if (a.key !== b.key) return false;

  const aModifiers = (a.modifiers || []).sort();
  const bModifiers = (b.modifiers || []).sort();

  if (aModifiers.length !== bModifiers.length) return false;

  return aModifiers.every((mod, index) => mod === bModifiers[index]);
}

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

export function useKeyboardShortcuts(
  shortcuts: TShortcutConfig[],
  options: TShortcutOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = createSignal<TKeyboardShortcutsState>(INITIAL_STATE);
  let timeoutRef: number | null = null;

  function clearSequence() {
    setState(prev => shortcutReducer(prev, { type: 'CLEAR_SEQUENCE' }));
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
  }

  function executeShortcut(shortcut: TShortcutConfig) {
    if (mergedOptions.debug) {
      console.log(`Executing shortcut: ${shortcut.name}`);
    }

    setState(prev => shortcutReducer(prev, { type: 'SET_MATCH', shortcutId: shortcut.id }));
    shortcut.action();
    clearSequence();
  }

  function handleKeyDown(event: KeyboardEvent) {
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

    if (timeoutRef) {
      clearTimeout(timeoutRef);
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

    timeoutRef = setTimeout(() => {
      clearSequence();
    }, mergedOptions.sequenceTimeout);

    if (mergedOptions.debug) {
      console.log(`Keystroke: ${key}${modifiers.length ? ` (${modifiers.join('+')})` : ''}`);
    }
  }

  createEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    });
  });

  function addShortcut(shortcut: TShortcutConfig) {
    shortcuts.push(shortcut);
  }

  function removeShortcut(id: string) {
    const index = shortcuts.findIndex(s => s.id === id);
    if (index !== -1) {
      shortcuts.splice(index, 1);
    }
  }

  function updateShortcut(id: string, updates: Partial<TShortcutConfig>) {
    const shortcut = shortcuts.find(s => s.id === id);
    if (shortcut) {
      Object.assign(shortcut, updates);
    }
  }

  function reset() {
    setState(prev => shortcutReducer(prev, { type: 'RESET' }));
    clearSequence();
  }

  return {
    get currentSequence() { return state().currentSequence; },
    get isRecording() { return state().isRecording; },
    get matchedShortcutId() { return state().matchedShortcutId; },
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
  TShortcutOptions,
};

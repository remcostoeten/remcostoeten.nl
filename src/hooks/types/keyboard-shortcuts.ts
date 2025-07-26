type TModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta' | 'cmd';

type TSpecialKey = 'space' | 'enter' | 'escape' | 'backspace' | 'delete' | 'tab' | 'arrowup' | 'arrowdown' | 'arrowleft' | 'arrowright';

type TKey = string | TSpecialKey;

type TKeystroke = {
  key: TKey;
  modifiers?: TModifierKey[];
};

type TShortcutSequence = TKeystroke[];

type TShortcutConfig = {
  id: string;
  name: string;
  description?: string;
  sequence: TShortcutSequence;
  action: () => void;
  enabled?: boolean;
  global?: boolean;
};

type TShortcutOptions = {
  sequenceTimeout?: number;
  preventDefaultOnMatch?: boolean;
  ignoreInputs?: boolean;
  debug?: boolean;
};

type TKeyboardShortcutsState = {
  currentSequence: TKeystroke[];
  isRecording: boolean;
  lastKeystroke: number;
  matchedShortcutId: string | null;
};

export type {
  TShortcutConfig,
  TShortcutSequence,
  TKeystroke,
  TModifierKey,
  TSpecialKey,
  TKey,
  TShortcutOptions,
  TKeyboardShortcutsState,
};

import { createSignal, onMount, onCleanup, Show, createEffect } from 'solid-js';
import { readRecentShortcut, clearRecentShortcut } from '../../utils/recent-shortcut';
import type { TDisplayKeystroke } from '../../hooks/types/keyboard-shortcuts';

type TShortcutSequence = {
  keys: string[];
  description: string;
  target?: string;
};

function KeyboardShortcutIndicator() {
  const [keystrokes, setKeystrokes] = createSignal<TDisplayKeystroke[]>([]);
  const [currentSequence, setCurrentSequence] = createSignal<string[]>([]);
  const [isVisible, setIsVisible] = createSignal(false);
  const [currentAction, setCurrentAction] = createSignal<string>('');
  const [isSequenceMode, setIsSequenceMode] = createSignal(false);

  const DISPLAY_DURATION = 2500;
  const MAX_KEYSTROKES = 5;
  const SEQUENCE_TIMEOUT = 2000;

  // Define the custom shortcuts
  const shortcuts: TShortcutSequence[] = [
    {
      keys: ['space', 'space', 'space', '1'],
      description: 'Navigate to Home',
      target: '/'
    },
    {
      keys: ['space', 'space', 'space', '2'],
      description: 'Navigate to About',
      target: '/about'
    },
    
    {
      keys: ['space', 'space', 'space', '4'],
      description: 'Navigate to Login',
      target: '/auth/login'
    },
    {
      keys: ['space', 'space', 'space', '5'],
      description: 'Navigate to Register',
      target: '/auth/register'
    },
    {
      keys: ['space', 'space', 'space', '6'],
      description: 'Navigate to Contact',
      target: '/contact'
    },
    
    {
      keys: ['space', 'space', 'space', '8'],
      description: 'Navigate to Projects',
      target: '/projects'
    }
  ];

  let sequenceTimeout: number | null = null;

  function formatKey(key: string): string {
    const keyMap: Record<string, string> = {
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Tab': '⇥',
      'Shift': '⇧',
      'Control': '⌃',
      'Alt': '⌥',
      'Meta': '⌘',
      'Enter': '↵',
      'Escape': '⎋',
      'Backspace': '⌫',
      'Delete': '⌦',
      'Home': '↖',
      'End': '↘',
      'PageUp': '⇞',
      'PageDown': '⇟',
      ' ': '␣'
    };
    
    return keyMap[key] || key.toUpperCase();
  }

  function getNavigationAction(event: KeyboardEvent): string | null {
    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    
    // Common navigation patterns
    if (ctrlKey || metaKey) {
      switch (key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          return 'Navigate History';
        case 'r':
          return 'Refresh Page';
        case 't':
          return 'New Tab';
        case 'w':
          return 'Close Tab';
        case 'l':
          return 'Focus Address Bar';
        case 'f':
          return 'Find in Page';
        case '+':
        case '=':
          return 'Zoom In';
        case '-':
          return 'Zoom Out';
        case '0':
          return 'Reset Zoom';
      }
    }

    if (altKey) {
      switch (key) {
        case 'ArrowLeft':
          return 'Back';
        case 'ArrowRight':
          return 'Forward';
      }
    }

    // Regular navigation
    switch (key) {
      case 'Tab':
        return shiftKey ? 'Previous Element' : 'Next Element';
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        return 'Navigate';
      case 'Enter':
        return 'Select/Activate';
      case 'Escape':
        return 'Cancel/Close';
      case 'Home':
        return 'Go to Top';
      case 'End':
        return 'Go to Bottom';
      case 'PageUp':
        return 'Page Up';
      case 'PageDown':
        return 'Page Down';
      default:
        return null;
    }
  }

  function clearSequence() {
    setCurrentSequence([]);
    setIsSequenceMode(false);
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = null;
    }
  }

  function checkForSequenceMatch(sequence: string[]): TShortcutSequence | null {
    return shortcuts.find(shortcut => 
      shortcut.keys.length === sequence.length &&
      shortcut.keys.every((key, index) => key === sequence[index])
    ) || null;
  }

  function checkForPartialMatch(sequence: string[]): boolean {
    return shortcuts.some(shortcut => 
      shortcut.keys.length >= sequence.length &&
      sequence.every((key, index) => shortcut.keys[index] === key)
    );
  }

  function handleKeyDown(event: KeyboardEvent) {
    // Skip if in input elements
    const activeElement = document.activeElement;
    if (activeElement && (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
      activeElement.hasAttribute('contenteditable')
    )) {
      return;
    }

    const key = event.key === ' ' ? 'space' : event.key.toLowerCase();
    
    // Handle sequence tracking for custom shortcuts
    const currentSeq = currentSequence();
    const newSequence = [...currentSeq, key];
    
    // Check for complete match
    const match = checkForSequenceMatch(newSequence);
    if (match) {
      const sequenceDisplay = newSequence.map(k => k === 'space' ? '␣' : k.toUpperCase()).join(' ');
      
      const newKeystroke: TDisplayKeystroke = {
        key: sequenceDisplay,
        timestamp: Date.now(),
        action: match.description
      };

      setKeystrokes(prev => [newKeystroke, ...prev.slice(0, MAX_KEYSTROKES - 1)]);
      setCurrentAction(match.description);
      setIsVisible(true);
      setIsSequenceMode(false);
      clearSequence();

      setTimeout(() => {
        setIsVisible(false);
      }, DISPLAY_DURATION);
      return;
    }
    
    // Check for partial match
    const hasPartialMatch = checkForPartialMatch(newSequence);
    if (hasPartialMatch) {
      setCurrentSequence(newSequence);
      setIsSequenceMode(true);
      
      const sequenceDisplay = newSequence.map(k => k === 'space' ? '␣' : k.toUpperCase()).join(' ');
      
      const newKeystroke: TDisplayKeystroke = {
        key: sequenceDisplay,
        timestamp: Date.now(),
        action: `Sequence: ${sequenceDisplay}...`
      };

      setKeystrokes(prev => [newKeystroke, ...prev.slice(0, MAX_KEYSTROKES - 1)]);
      setCurrentAction(`Sequence: ${sequenceDisplay}...`);
      setIsVisible(true);

      // Clear sequence timeout
      if (sequenceTimeout) clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(() => {
        clearSequence();
        setIsVisible(false);
      }, SEQUENCE_TIMEOUT);
      return;
    }
    
    // Clear sequence if no match
    if (currentSeq.length > 0) {
      clearSequence();
    }

    // Handle regular navigation shortcuts
    const action = getNavigationAction(event);
    
    if (!action) return;

    const modifiers = [];
    if (event.ctrlKey) modifiers.push('⌃');
    if (event.altKey) modifiers.push('⌥');
    if (event.metaKey) modifiers.push('⌘');
    if (event.shiftKey) modifiers.push('⇧');

    const keyDisplay = [...modifiers, formatKey(event.key)].join(' + ');
    
    const newKeystroke: TDisplayKeystroke = {
      key: keyDisplay,
      timestamp: Date.now(),
      action
    };

    setKeystrokes(prev => [newKeystroke, ...prev.slice(0, MAX_KEYSTROKES - 1)]);
    setCurrentAction(action);
    setIsVisible(true);

    // Auto-hide after duration
    setTimeout(() => {
      setIsVisible(false);
    }, DISPLAY_DURATION);
  }

  // Clean up old keystrokes
  createEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setKeystrokes(prev => prev.filter(k => now - k.timestamp < DISPLAY_DURATION * 2));
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

onMount(() => {
    const recentShortcut = readRecentShortcut();
    if (recentShortcut && Date.now() - recentShortcut.timestamp < DISPLAY_DURATION) {
      setKeystrokes([recentShortcut, ...keystrokes()]);
      setCurrentAction(recentShortcut.action);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
        clearRecentShortcut();
      }, DISPLAY_DURATION);
    }
    document.addEventListener('keydown', handleKeyDown, { passive: true });
    
    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    });
  });

  return (
    <Show when={isVisible() && keystrokes().length > 0}>
      <div class="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div class="bg-card border-border rounded-lg p-4 shadow-2xl backdrop-blur-sm animate-fadeInUp">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1.5 h-1.5 bg-accent rounded-full"></div>
            <span class="text-foreground text-sm font-medium">{currentAction()}</span>
          </div>
          
          <div class="space-y-2">
            {keystrokes().slice(0, 3).map((keystroke, index) => (
              <div 
                class={`flex items-center gap-2 transition-all duration-300 ${
                  index === 0 ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div class="flex items-center gap-1.5">
                  {keystroke.key.split(' + ').map((part, partIndex) => (
                    <>
                      <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-muted border-border rounded text-muted-foreground text-xs font-medium">
                        {part}
                      </span>
                      {partIndex < keystroke.key.split(' + ').length - 1 && (
                        <span class="text-muted-foreground text-xs font-medium">+</span>
                      )}
                    </>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {keystrokes().length > 3 && (
            <div class="text-xs text-muted-foreground mt-2 text-center font-medium">
              +{keystrokes().length - 3} more
            </div>
          )}
        </div>
      </div>
    </Show>
  );
}

export default KeyboardShortcutIndicator;

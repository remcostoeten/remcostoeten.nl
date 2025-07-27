import { createSignal, onMount, onCleanup, Show, createEffect } from 'solid-js';

type TKeyStroke = {
  key: string;
  timestamp: number;
  action?: string;
};

function KeyboardShortcutIndicator() {
  const [keystrokes, setKeystrokes] = createSignal<TKeyStroke[]>([]);
  const [isVisible, setIsVisible] = createSignal(false);
  const [currentAction, setCurrentAction] = createSignal<string>('');

  const DISPLAY_DURATION = 2500;
  const MAX_KEYSTROKES = 5;

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

  function handleKeyDown(event: KeyboardEvent) {
    const action = getNavigationAction(event);
    
    if (!action) return;

    const modifiers = [];
    if (event.ctrlKey) modifiers.push('⌃');
    if (event.altKey) modifiers.push('⌥');
    if (event.metaKey) modifiers.push('⌘');
    if (event.shiftKey) modifiers.push('⇧');

    const keyDisplay = [...modifiers, formatKey(event.key)].join(' + ');
    
    const newKeystroke: TKeyStroke = {
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
    document.addEventListener('keydown', handleKeyDown, { passive: true });
    
    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  });

  return (
    <Show when={isVisible() && keystrokes().length > 0}>
      <div class="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div class="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-white/90 text-sm font-medium">{currentAction()}</span>
          </div>
          
          <div class="space-y-1">
            {keystrokes().slice(0, 3).map((keystroke, index) => (
              <div 
                class={`flex items-center gap-2 transition-all duration-300 ${
                  index === 0 ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div class="flex items-center gap-1">
                  {keystroke.key.split(' + ').map((part, partIndex) => (
                    <>
                      <kbd class="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-white/10 border border-white/20 rounded text-white/90 text-xs font-mono leading-none">
                        {part}
                      </kbd>
                      {partIndex < keystroke.key.split(' + ').length - 1 && (
                        <span class="text-white/50 text-xs">+</span>
                      )}
                    </>
                  ))}
                </div>
                
                {index === 0 && (
                  <div class="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
          
          {keystrokes().length > 3 && (
            <div class="text-xs text-white/50 mt-2 text-center">
              +{keystrokes().length - 3} more
            </div>
          )}
        </div>
      </div>
    </Show>
  );
}

export default KeyboardShortcutIndicator;
